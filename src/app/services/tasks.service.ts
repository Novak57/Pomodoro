import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, computed, effect, signal } from '@angular/core';

const STORAGE_KEY = 'pomodoro.tasks.v1';

export interface TaskItem {
  id: string;
  title: string;
  done: boolean;
}

function isTaskItem(x: unknown): x is TaskItem {
  if (!x || typeof x !== 'object') {
    return false;
  }
  const o = x as Record<string, unknown>;
  return (
    typeof o['id'] === 'string' &&
    typeof o['title'] === 'string' &&
    typeof o['done'] === 'boolean'
  );
}

function partitionIncompleteFirst(list: TaskItem[]): TaskItem[] {
  return [...list.filter((t) => !t.done), ...list.filter((t) => t.done)];
}

@Injectable()
export class TasksService {
  readonly tasks = signal<TaskItem[]>([]);

  readonly currentTask = computed(() => this.tasks().find((t) => !t.done) ?? null);

  constructor() {
    this.load();
    effect(() => {
      const list = this.tasks();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch {
      }
    });
  }

  addTask(rawTitle: string): void {
    const title = rawTitle.trim().slice(0, 200);
    if (!title) {
      return;
    }
    const item: TaskItem = { id: crypto.randomUUID(), title, done: false };
    this.tasks.update((list) => {
      const inc = list.filter((t) => !t.done);
      const comp = list.filter((t) => t.done);
      return [item, ...inc, ...comp];
    });
  }

  removeTask(id: string): void {
    this.tasks.update((list) => list.filter((t) => t.id !== id));
  }

  setTaskDone(id: string, done: boolean): void {
    this.tasks.update((list) => {
      const t = list.find((x) => x.id === id);
      if (!t || t.done === done) {
        return list;
      }
      const rest = list.filter((x) => x.id !== id);
      const inc = rest.filter((x) => !x.done);
      const comp = rest.filter((x) => x.done);
      if (done) {
        return [...inc, ...comp, { ...t, done: true }];
      }
      return [{ ...t, done: false }, ...inc, ...comp];
    });
  }

  reorderTasks(previousIndex: number, currentIndex: number): void {
    if (previousIndex === currentIndex) {
      return;
    }
    this.tasks.update((list) => {
      const next = [...list];
      moveItemInArray(next, previousIndex, currentIndex);
      return partitionIncompleteFirst(next);
    });
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return;
      }
      const items = parsed.filter(isTaskItem);
      this.tasks.set(partitionIncompleteFirst(items));
    } catch {
    }
  }
}
