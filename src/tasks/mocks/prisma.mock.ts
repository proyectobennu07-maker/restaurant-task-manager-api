import {
  mockTask,
  mockTaskWithUser,
  mockTaskList,
  mockAssignment,
} from './fixtures';

export const createMockTasksService = () => ({
  create: jest.fn().mockResolvedValue(mockTask),
  findAll: jest.fn().mockResolvedValue(mockTaskList),
  findByArea: jest.fn().mockResolvedValue([mockTask]),
  updatePriority: jest.fn().mockResolvedValue(mockTask),
  assignTask: jest.fn().mockResolvedValue(mockTaskWithUser),
  findMyTasks: jest.fn().mockResolvedValue([mockTaskWithUser]),
  updateStatus: jest.fn().mockResolvedValue(mockTask),
  remove: jest.fn().mockResolvedValue(mockTask),
});

export const createMockAssignmentsService = () => ({
  create: jest.fn().mockResolvedValue(mockAssignment),
  findAll: jest.fn().mockResolvedValue([mockAssignment]),
  findOne: jest.fn().mockResolvedValue(mockAssignment),
  remove: jest.fn().mockResolvedValue(mockAssignment),
});
