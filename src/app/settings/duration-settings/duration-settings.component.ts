import { Component, inject } from '@angular/core';

import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-duration-settings',
  imports: [],
  templateUrl: './duration-settings.component.html',
  styleUrl: './duration-settings.component.css',
})
export class DurationSettingsComponent {
  protected readonly timer = inject(TimerService);
}
