import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { PomodoroHeaderComponent } from './header/pomodoro-header.component';
import { TimerComponent } from './timer/timer.component';

@Component({
  selector: 'app-root',
  imports: [MatDialogModule, PomodoroHeaderComponent, TimerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
