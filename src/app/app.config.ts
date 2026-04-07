import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { NotificationsService } from './services/notifications.service';
import { SettingsPersistenceService } from './services/settings-persistence.service';
import { TimerService } from './services/timer.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    NotificationsService,
    TimerService,
    SettingsPersistenceService,
  ],
};
