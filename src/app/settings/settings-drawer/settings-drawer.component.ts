import { Component, inject } from '@angular/core';

import { SettingsPersistenceService } from '../../services/settings-persistence.service';
import { TimerService } from '../../services/timer.service';

import { AlertSettingsComponent } from '../alert-settings/alert-settings.component';
import { DurationSettingsComponent } from '../duration-settings/duration-settings.component';
import { TimerBehaviorSettingsComponent } from '../timer-behavior-settings/timer-behavior-settings.component';

@Component({
  selector: 'app-settings-drawer',
  imports: [
    AlertSettingsComponent,
    DurationSettingsComponent,
    TimerBehaviorSettingsComponent,
  ],
  templateUrl: './settings-drawer.component.html',
  styleUrl: './settings-drawer.component.css',
})
export class SettingsDrawerComponent {
  protected readonly timer = inject(TimerService);
  protected readonly persistence = inject(SettingsPersistenceService);
}
