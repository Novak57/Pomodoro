import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { SettingsPersistenceService } from '../../services/settings-persistence.service';

import { AlertSettingsComponent } from '../alert-settings/alert-settings.component';
import { DurationSettingsComponent } from '../duration-settings/duration-settings.component';
import { TimerBehaviorSettingsComponent } from '../timer-behavior-settings/timer-behavior-settings.component';

@Component({
  selector: 'app-settings-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    AlertSettingsComponent,
    DurationSettingsComponent,
    TimerBehaviorSettingsComponent,
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.css',
})
export class SettingsDialogComponent {
  protected readonly persistence = inject(SettingsPersistenceService);
}
