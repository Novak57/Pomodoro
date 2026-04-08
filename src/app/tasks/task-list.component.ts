import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TasksService, type TaskItem } from '../services/tasks.service';

@Component({
  selector: 'app-task-list',
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent {
  protected readonly tasks = inject(TasksService);

  onAddTask(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    this.tasks.addTask(input.value);
    input.value = '';
    input.focus();
  }

  onListDrop(event: CdkDragDrop<TaskItem>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    this.tasks.reorderTasks(event.previousIndex, event.currentIndex);
  }
}
