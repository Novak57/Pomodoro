import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TasksService } from '../services/tasks.service';
import { TaskListComponent } from '../tasks/task-list.component';
import { TimerService } from '../services/timer.service';

const RING_RADIUS = 54;

@Component({
  selector: 'app-timer',
  imports: [MatButtonModule, MatTooltipModule, TaskListComponent],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent {
  protected readonly timer = inject(TimerService);
  protected readonly tasks = inject(TasksService);

  protected readonly ringCircumference = 2 * Math.PI * RING_RADIUS;
}
