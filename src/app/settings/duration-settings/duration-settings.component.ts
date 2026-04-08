import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-duration-settings',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './duration-settings.component.html',
  styleUrl: './duration-settings.component.css',
})
export class DurationSettingsComponent {
  protected readonly timer = inject(TimerService);
}
