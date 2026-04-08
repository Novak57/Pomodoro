import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { NotificationsService } from './services/notifications.service';
import { SettingsPersistenceService } from './services/settings-persistence.service';
import { TasksService } from './services/tasks.service';
import { TimerService } from './services/timer.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    NotificationsService,
    TimerService,
    TasksService,
    SettingsPersistenceService,
  ],
};
