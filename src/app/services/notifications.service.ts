import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';

import {
  type AppNotificationPermission,
  type PhaseEndNotificationCopy,
  type PomodoroPhase,
  getInitialNotificationPermission,
} from '../models/pomodoro.types';

const DEFAULT_TITLE = 'Pomodoro';

function resolveAudioContextConstructor(): typeof AudioContext {
  const g = globalThis as typeof globalThis & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return g.AudioContext ?? g.webkitAudioContext ?? AudioContext;
}

@Injectable()
export class NotificationsService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private chimeContext: AudioContext | null = null;

  readonly notificationsWanted = signal(false);
  readonly notificationPermission = signal<AppNotificationPermission>(
    getInitialNotificationPermission(),
  );

  readonly chimeOnPhaseEnd = signal(true);

  constructor() {
    this.destroyRef.onDestroy(() => {
      void this.chimeContext?.close();
    });
  }

  resumeChimeContextIfPresent(): void {
    void this.chimeContext?.resume();
  }

  onNotificationsCheckboxChange(checked: boolean): void {
    void this.toggleNotificationsDesired(checked);
  }

  onChimeCheckboxChange(checked: boolean): void {
    this.chimeOnPhaseEnd.set(checked);
  }

  applyPersistedNotificationSlice(data: {
    notificationsWanted?: boolean;
    chimeOnPhaseEnd?: boolean;
  }): void {
    if (typeof data.chimeOnPhaseEnd === 'boolean') {
      this.chimeOnPhaseEnd.set(data.chimeOnPhaseEnd);
    }
    if (typeof data.notificationsWanted === 'boolean') {
      this.notificationsWanted.set(data.notificationsWanted);
    }
  }

  async toggleNotificationsDesired(on: boolean): Promise<void> {
    if (!on) {
      this.notificationsWanted.set(false);
      return;
    }
    if (typeof Notification === 'undefined') {
      this.notificationPermission.set('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      return;
    }
    if (Notification.permission === 'granted') {
      this.notificationsWanted.set(true);
      return;
    }
    const result = await Notification.requestPermission();
    this.notificationPermission.set(result);
    this.notificationsWanted.set(result === 'granted');
  }

  onPhaseCompleted(completed: PomodoroPhase): void {
    this.playChimeIfEnabled();
    this.showNotificationIfEnabled(completed);
  }

  private showNotificationIfEnabled(completed: PomodoroPhase): void {
    if (!this.notificationsWanted()) {
      return;
    }
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }
    const copy = this.notificationCopy(completed);
    const iconUrl = new URL('favicon.svg', this.document.baseURI).href;
    try {
      new Notification(copy.title, {
        body: copy.body,
        icon: iconUrl,
        silent: this.chimeOnPhaseEnd(),
      });
    } catch {
    }
  }

  private notificationCopy(completed: PomodoroPhase): PhaseEndNotificationCopy {
    const title = DEFAULT_TITLE;
    switch (completed) {
      case 'work':
        return {
          title,
          body: 'Focus block finished — time for a break.',
        };
      case 'shortBreak':
        return {
          title,
          body: 'Short break over — back to focus.',
        };
      case 'longBreak':
        return {
          title,
          body: 'Long break over — start your next cycle.',
        };
    }
  }

  private playChimeIfEnabled(): void {
    if (!this.chimeOnPhaseEnd()) {
      return;
    }
    try {
      const AudioContextCtor = resolveAudioContextConstructor();
      if (!this.chimeContext) {
        this.chimeContext = new AudioContextCtor();
      }
      const ctx = this.chimeContext;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t0);
      gain.gain.setValueAtTime(0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.22);
    } catch {
    }
  }
}
