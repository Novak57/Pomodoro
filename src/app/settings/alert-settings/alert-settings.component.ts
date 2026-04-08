import { Component, inject } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-alert-settings',
  imports: [MatCheckboxModule],
  templateUrl: './alert-settings.component.html',
  styleUrl: './alert-settings.component.css',
})
export class AlertSettingsComponent {
  protected readonly notifications = inject(NotificationsService);
}
