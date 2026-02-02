import { Task, Assignment, TaskStatus, TaskArea } from '@prisma/client';
import { TaskPriority } from '../enums/task-priority.enum';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskPriorityDto } from '../dto/update-task-priority.dto';

// ==================== ENUMS ====================
export const mockTaskArea: TaskArea = 'COCINA';
export const mockTaskAreaBarra: TaskArea = 'BARRA';
export const mockTaskAreaSalon: TaskArea = 'SALON';

export const mockTaskPriority: TaskPriority = TaskPriority.HIGH;
export const mockTaskPriorityMedium: TaskPriority = TaskPriority.MEDIUM;
export const mockTaskPriorityLow: TaskPriority = TaskPriority.LOW;

export const mockTaskStatus: TaskStatus = 'PENDING';
export const mockTaskStatusInProgress: TaskStatus = 'IN_PROGRESS';
export const mockTaskStatusDone: TaskStatus = 'DONE';

// ==================== TASKS ====================
export const mockTask: Task = {
  id: 'task-uuid-001',
  title: 'Limpiar cocina',
  description: 'Limpiar todas las superficies de la cocina',
  status: mockTaskStatus,
  priority: mockTaskPriority,
  area: mockTaskArea,
  estimatedTime: 30,
  assignedToId: null,
  createdAt: new Date('2026-02-01T10:00:00Z'),
  updatedAt: new Date('2026-02-01T10:00:00Z'),
};

export const mockTaskWithUser: Task = {
  ...mockTask,
  id: 'task-uuid-002',
  assignedToId: 'user-uuid-001',
  title: 'Preparar barra',
  area: mockTaskAreaBarra,
};

export const mockTaskInProgress: Task = {
  ...mockTask,
  id: 'task-uuid-003',
  status: mockTaskStatusInProgress,
  assignedToId: 'user-uuid-001',
};

export const mockTaskDone: Task = {
  ...mockTask,
  id: 'task-uuid-004',
  status: mockTaskStatusDone,
  priority: mockTaskPriorityLow,
  area: mockTaskAreaSalon,
};

export const mockTaskLowPriority: Task = {
  ...mockTask,
  id: 'task-uuid-005',
  priority: mockTaskPriorityLow,
  area: mockTaskAreaBarra,
};

export const mockTaskMediumPriority: Task = {
  ...mockTask,
  id: 'task-uuid-006',
  priority: mockTaskPriorityMedium,
  area: mockTaskAreaSalon,
};

// ==================== ASSIGNMENTS ====================
export const mockAssignment: Assignment = {
  id: 'assignment-uuid-001',
  userId: 'user-uuid-001',
  taskId: 'task-uuid-001',
  status: 'PENDING',
  createdAt: new Date('2026-02-01T10:00:00Z'),
};

export const mockAssignmentMultiple: Assignment[] = [
  mockAssignment,
  {
    id: 'assignment-uuid-002',
    userId: 'user-uuid-002',
    taskId: 'task-uuid-001',
    status: 'PENDING',
    createdAt: new Date('2026-02-01T10:05:00Z'),
  },
];

// ==================== DTOs ====================
export const mockCreateTaskDto: CreateTaskDto = {
  title: 'Nueva tarea importante',
  description: 'Descripción de la nueva tarea',
  priority: TaskPriority.MEDIUM,
  area: mockTaskAreaSalon,
  estimatedTime: 45,
};

export const mockCreateTaskDtoMinimal: CreateTaskDto = {
  title: 'Tarea rápida',
  area: mockTaskArea,
};

export const mockUpdateTaskPriorityDto: UpdateTaskPriorityDto = {
  priority: TaskPriority.LOW,
};

// ==================== ARRAYS ====================
export const mockUserTasks: Task[] = [mockTaskWithUser, mockTaskInProgress];

export const mockTasksByArea = {
  COCINA: [mockTask, mockTaskInProgress],
  BARRA: [mockTaskWithUser, mockTaskLowPriority],
  SALON: [mockTaskDone, mockTaskMediumPriority],
  CAJA: [],
  ALMACEN: [],
};

export const mockTaskList: Task[] = [
  mockTask,
  mockTaskWithUser,
  mockTaskInProgress,
  mockTaskDone,
  mockTaskLowPriority,
  mockTaskMediumPriority,
];

// ==================== HELPER FUNCTIONS ====================
export const createMockTask = (overrides?: Partial<Task>): Task => ({
  ...mockTask,
  ...overrides,
});

export const createMockAssignment = (
  overrides?: Partial<Assignment>,
): Assignment => ({
  ...mockAssignment,
  ...overrides,
});
