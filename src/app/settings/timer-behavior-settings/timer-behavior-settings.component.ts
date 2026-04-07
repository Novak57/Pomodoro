import { Component, inject } from '@angular/core';

import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-timer-behavior-settings',
  imports: [],
  templateUrl: './timer-behavior-settings.component.html',
  styleUrl: './timer-behavior-settings.component.css',
})
export class TimerBehaviorSettingsComponent {
  protected readonly timer = inject(TimerService);
}
