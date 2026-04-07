export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

export interface PhaseEndNotificationCopy {
  title: string;
  body: string;
}

export type AppNotificationPermission = NotificationPermission | 'unsupported';

export function getInitialNotificationPermission(): AppNotificationPermission {
  if (typeof Notification === 'undefined') {
    return 'unsupported';
  }
  return Notification.permission;
}
