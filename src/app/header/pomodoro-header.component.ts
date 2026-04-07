import { Component, inject } from '@angular/core';

import { TimerService } from '../services/timer.service';

@Component({
  selector: 'app-pomodoro-header',
  imports: [],
  templateUrl: './pomodoro-header.component.html',
  styleUrl: './pomodoro-header.component.css',
})
export class PomodoroHeaderComponent {
  protected readonly timer = inject(TimerService);
}
