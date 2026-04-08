import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { type PomodoroPhase } from '../models/pomodoro.types';
import { SettingsDialogComponent } from '../settings/settings-dialog/settings-dialog.component';
import { NotificationsService } from './notifications.service';
import { TasksService } from './tasks.service';

const DEFAULT_TITLE = 'Pomodoro';

@Injectable()
export class TimerService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly notifications = inject(NotificationsService);
  private readonly tasks = inject(TasksService);
  private readonly dialog = inject(MatDialog);
  private settingsDialogRef: MatDialogRef<SettingsDialogComponent> | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly phase = signal<PomodoroPhase>('work');
  readonly remainingSeconds = signal(25 * 60);
  readonly isRunning = signal(false);
  readonly sessionNumber = signal(1);

  readonly workMinutes = signal(25);
  readonly shortBreakMinutes = signal(5);
  readonly longBreakMinutes = signal(15);

  readonly autoStartBreaks = signal(false);
  readonly autoStartFocus = signal(false);

  readonly phaseLabel = computed(() => {
    switch (this.phase()) {
      case 'work':
        return 'Focus';
      case 'shortBreak':
        return 'Short break';
      case 'longBreak':
        return 'Long break';
    }
  });

  readonly formattedTime = computed(() => {
    const total = this.remainingSeconds();
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  readonly progress = computed(() => {
    const total = this.totalForPhase(this.phase());
    if (total <= 0) {
      return 0;
    }
    return 1 - this.remainingSeconds() / total;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.settingsDialogRef?.close();
      this.clearTimer();
    });

    effect(() => {
      if (!this.isRunning()) {
        return;
      }
      void this.formattedTime();
      void this.phase();
      void this.tasks.currentTask()?.id;
      void this.tasks.currentTask()?.title;
      this.updateDocumentTitle();
    });
  }

  openSettings(): void {
    if (this.settingsDialogRef) {
      return;
    }
    this.settingsDialogRef = this.dialog.open(SettingsDialogComponent, {
      panelClass: 'pomodoro-settings-dialog',
      backdropClass: 'pomodoro-settings-backdrop',
      width: '440px',
      maxWidth: 'calc(100vw - 1.5rem)',
      maxHeight: 'min(90dvh, 720px)',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });
    this.settingsDialogRef.afterClosed().subscribe(() => {
      this.settingsDialogRef = null;
    });
  }

  closeSettings(): void {
    this.settingsDialogRef?.close();
    this.settingsDialogRef = null;
  }

  start(): void {
    if (this.isRunning()) {
      return;
    }
    this.isRunning.set(true);
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.notifications.resumeChimeContextIfPresent();
  }

  pause(): void {
    this.isRunning.set(false);
    this.clearTimer();
  }

  resetPhase(): void {
    this.pause();
    this.remainingSeconds.set(this.totalForPhase(this.phase()));
  }

  skipPhase(): void {
    this.pause();
    this.advancePhase();
  }

  applyDurations(): void {
    if (this.isRunning()) {
      return;
    }
    this.remainingSeconds.set(this.totalForPhase(this.phase()));
  }

  onWorkMinutesInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const v = +input.value;
    this.workMinutes.set(Number.isFinite(v) && v > 0 ? Math.min(120, v) : 1);
    this.applyDurations();
  }

  onShortBreakInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const v = +input.value;
    this.shortBreakMinutes.set(Number.isFinite(v) && v > 0 ? Math.min(60, v) : 1);
    this.applyDurations();
  }

  onLongBreakInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const v = +input.value;
    this.longBreakMinutes.set(Number.isFinite(v) && v > 0 ? Math.min(60, v) : 1);
    this.applyDurations();
  }

  onAutoStartBreaksChange(checked: boolean): void {
    this.autoStartBreaks.set(checked);
  }

  onAutoStartFocusChange(checked: boolean): void {
    this.autoStartFocus.set(checked);
  }

  applyPersistedTimerSlice(data: {
    workMinutes?: number;
    shortBreakMinutes?: number;
    longBreakMinutes?: number;
    autoStartBreaks?: boolean;
    autoStartFocus?: boolean;
  }): void {
    const clamp = (n: number, max: number) =>
      Math.max(1, Math.min(max, Math.floor(Number(n))));

    if (data.workMinutes != null && Number.isFinite(data.workMinutes)) {
      this.workMinutes.set(clamp(data.workMinutes, 120));
    }
    if (data.shortBreakMinutes != null && Number.isFinite(data.shortBreakMinutes)) {
      this.shortBreakMinutes.set(clamp(data.shortBreakMinutes, 60));
    }
    if (data.longBreakMinutes != null && Number.isFinite(data.longBreakMinutes)) {
      this.longBreakMinutes.set(clamp(data.longBreakMinutes, 60));
    }
    if (typeof data.autoStartBreaks === 'boolean') {
      this.autoStartBreaks.set(data.autoStartBreaks);
    }
    if (typeof data.autoStartFocus === 'boolean') {
      this.autoStartFocus.set(data.autoStartFocus);
    }
    this.applyDurations();
  }

  private tick(): void {
    const next = this.remainingSeconds() - 1;
    if (next <= 0) {
      this.remainingSeconds.set(0);
      this.clearTimer();
      this.isRunning.set(false);
      this.advancePhase();
      return;
    }
    this.remainingSeconds.set(next);
    this.updateDocumentTitle();
  }

  private advancePhase(): void {
    const completed = this.phase();
    if (completed === 'work') {
      const n = this.sessionNumber();
      if (n >= 4) {
        this.phase.set('longBreak');
        this.remainingSeconds.set(this.totalForPhase('longBreak'));
        this.sessionNumber.set(1);
      } else {
        this.phase.set('shortBreak');
        this.remainingSeconds.set(this.totalForPhase('shortBreak'));
      }
    } else if (completed === 'shortBreak') {
      this.sessionNumber.update((x) => x + 1);
      this.phase.set('work');
      this.remainingSeconds.set(this.totalForPhase('work'));
    } else {
      this.phase.set('work');
      this.remainingSeconds.set(this.totalForPhase('work'));
    }
    this.notifications.onPhaseCompleted(completed);
    this.updateDocumentTitle(true);
    this.maybeAutoStartAfterPhaseChange(completed);
  }

  private maybeAutoStartAfterPhaseChange(completedPhase: PomodoroPhase): void {
    const next = this.phase();
    const enteredBreak = next === 'shortBreak' || next === 'longBreak';
    const enteredFocusFromBreak =
      next === 'work' &&
      (completedPhase === 'shortBreak' || completedPhase === 'longBreak');

    if (enteredBreak && this.autoStartBreaks()) {
      this.start();
    } else if (enteredFocusFromBreak && this.autoStartFocus()) {
      this.start();
    }
  }

  private totalForPhase(phaseValue: PomodoroPhase): number {
    switch (phaseValue) {
      case 'work':
        return Math.max(1, this.workMinutes()) * 60;
      case 'shortBreak':
        return Math.max(1, this.shortBreakMinutes()) * 60;
      case 'longBreak':
        return Math.max(1, this.longBreakMinutes()) * 60;
    }
  }

  private clearTimer(): void {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private updateDocumentTitle(reset = false): void {
    if (reset) {
      this.title.setTitle(DEFAULT_TITLE);
      return;
    }
    if (this.isRunning()) {
      const ct = this.tasks.currentTask();
      const taskPrefix =
        this.phase() === 'work' && ct ? `${ct.title} · ` : '';
      this.title.setTitle(`${this.formattedTime()} · ${taskPrefix}${this.phaseLabel()}`);
    }
  }
}
