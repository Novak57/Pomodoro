import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { vi } from 'vitest';
import { AppComponent } from './app.component';
import { NotificationsService } from './services/notifications.service';
import { SettingsPersistenceService } from './services/settings-persistence.service';
import { TimerService } from './services/timer.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    vi.stubGlobal(
      'Notification',
      class {
        static permission: NotificationPermission = 'denied';
        static requestPermission(): Promise<NotificationPermission> {
          return Promise.resolve('denied');
        }
      },
    );

    const titleStub = {
      setTitle: vi.fn(),
    } as unknown as Title;

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        NotificationsService,
        TimerService,
        SettingsPersistenceService,
        { provide: Title, useValue: titleStub },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);

    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render app title', async () => {
    const fixture = TestBed.createComponent(AppComponent);

    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.logo')?.textContent).toContain('Pomodoro');
  });
});
