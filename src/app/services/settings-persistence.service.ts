import { Injectable, effect, inject } from '@angular/core';

import { NotificationsService } from './notifications.service';
import { TimerService } from './timer.service';

const STORAGE_KEY = 'pomodoro.settings.v1';

export interface PersistedAppSettingsV1 {
  v: 1;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  notificationsWanted: boolean;
  chimeOnPhaseEnd: boolean;
}

function parseStored(raw: string | null): Partial<PersistedAppSettingsV1> | null {
  if (raw == null || raw === '') {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed as Partial<PersistedAppSettingsV1>;
  } catch {
    return null;
  }
}

@Injectable()
export class SettingsPersistenceService {
  private readonly timer = inject(TimerService);
  private readonly notifications = inject(NotificationsService);

  constructor() {
    this.loadAndApply();

    effect(() => {
      void this.timer.workMinutes();
      void this.timer.shortBreakMinutes();
      void this.timer.longBreakMinutes();
      void this.timer.autoStartBreaks();
      void this.timer.autoStartFocus();
      void this.notifications.notificationsWanted();
      void this.notifications.chimeOnPhaseEnd();
      this.writeStored();
    });
  }

  saveAndClose(): void {
    this.writeStored();
    this.timer.closeSettings();
  }

  private loadAndApply(): void {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    const data = parseStored(raw);
    if (data == null) {
      return;
    }
    this.timer.applyPersistedTimerSlice({
      workMinutes: data.workMinutes,
      shortBreakMinutes: data.shortBreakMinutes,
      longBreakMinutes: data.longBreakMinutes,
      autoStartBreaks: data.autoStartBreaks,
      autoStartFocus: data.autoStartFocus,
    });
    this.notifications.applyPersistedNotificationSlice({
      notificationsWanted: data.notificationsWanted,
      chimeOnPhaseEnd: data.chimeOnPhaseEnd,
    });
  }

  private writeStored(): void {
    const payload: PersistedAppSettingsV1 = {
      v: 1,
      workMinutes: this.timer.workMinutes(),
      shortBreakMinutes: this.timer.shortBreakMinutes(),
      longBreakMinutes: this.timer.longBreakMinutes(),
      autoStartBreaks: this.timer.autoStartBreaks(),
      autoStartFocus: this.timer.autoStartFocus(),
      notificationsWanted: this.notifications.notificationsWanted(),
      chimeOnPhaseEnd: this.notifications.chimeOnPhaseEnd(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
    }
  }
}
