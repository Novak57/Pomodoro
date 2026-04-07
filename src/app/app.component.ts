import { Component, inject } from '@angular/core';

import { PomodoroHeaderComponent } from './header/pomodoro-header.component';
import { TimerService } from './services/timer.service';
import { SettingsDrawerComponent } from './settings/settings-drawer/settings-drawer.component';
import { TimerComponent } from './timer/timer.component';

@Component({
  selector: 'app-root',
  imports: [PomodoroHeaderComponent, SettingsDrawerComponent, TimerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly timer = inject(TimerService);
}
