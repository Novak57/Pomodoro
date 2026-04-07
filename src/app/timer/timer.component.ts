import { Component, inject } from '@angular/core';

import { TimerService } from '../services/timer.service';

const RING_RADIUS = 54;

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent {
  protected readonly timer = inject(TimerService);

  /** Stroke length for dasharray (2πr) — standard SVG circular progress pattern. */
  protected readonly ringCircumference = 2 * Math.PI * RING_RADIUS;
}
