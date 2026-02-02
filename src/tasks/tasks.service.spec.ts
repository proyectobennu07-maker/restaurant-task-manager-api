/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  mockTask,
  mockTaskWithUser,
  mockTaskInProgress,
  mockTaskList,
  mockCreateTaskDto,
  mockCreateTaskDtoMinimal,
  mockAssignment,
  createMockTask,
  mockTaskArea,
} from './mocks/fixtures';
import { TaskPriority } from './enums/task-priority.enum';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            assignment: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== CREATE ====================
  describe('create', () => {
    it('should create a task with all fields', async () => {
      const createDto = mockCreateTaskDto;
      prisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create(createDto);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createDto.title,
          description: createDto.description,
          priority: createDto.priority,
          area: createDto.area,
          estimatedTime: createDto.estimatedTime,
        }),
      });
      expect(result).toEqual(mockTask);
    });

    it('should create a task with minimal fields (title and area only)', async () => {
      const createDto = mockCreateTaskDtoMinimal;
      const expectedResult = createMockTask({
        title: createDto.title,
        area: createDto.area,
        priority: TaskPriority.MEDIUM,
      });
      prisma.task.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(prisma.task.create).toHaveBeenCalled();
      expect(result.title).toBe(createDto.title);
      expect(result.area).toBe(createDto.area);
    });

    it('should set default priority to MEDIUM when not provided', async () => {
      const createDto = { title: 'Test', area: mockTaskArea };
      prisma.task.create.mockResolvedValue(
        createMockTask({ priority: TaskPriority.MEDIUM }),
      );

      const result = await service.create(createDto);

      expect(result.priority).toBe(TaskPriority.MEDIUM);
    });

    it('should handle database errors during creation', async () => {
      prisma.task.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.create(mockCreateTaskDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  // ==================== FIND ALL ====================
  describe('findAll', () => {
    it('should return all tasks', async () => {
      prisma.task.findMany.mockResolvedValue(mockTaskList);

      const result = await service.findAll();

      expect(prisma.task.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockTaskList);
      expect(result.length).toBe(6);
    });

    it('should return empty array when no tasks exist', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should include task relationships when fetched', async () => {
      const taskWithRelations = {
        ...mockTaskWithUser,
        assignments: [mockAssignment],
      };
      prisma.task.findMany.mockResolvedValue([taskWithRelations]);

      const result = await service.findAll();

      expect(result[0].assignedToId).toBe('user-uuid-001');
    });
  });

  // ==================== FIND BY AREA ====================
  describe('findByArea', () => {
    it('should return tasks filtered by area', async () => {
      const cocinaTasks = [mockTask, mockTaskInProgress];
      prisma.task.findMany.mockResolvedValue(cocinaTasks);

      const result = await service.findByArea(mockTaskArea);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { area: mockTaskArea },
      });
      expect(result).toEqual(cocinaTasks);
    });

    it('should return empty array for area with no tasks', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      const result = await service.findByArea('CAJA');

      expect(result).toEqual([]);
    });

    it('should handle invalid area gracefully', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      const result = await service.findByArea(mockTaskArea);

      expect(result).toEqual([]);
    });

    it('should handle database errors during filter', async () => {
      prisma.task.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.findByArea(mockTaskArea)).rejects.toThrow(
        'Database error',
      );
    });
  });

  // ==================== UPDATE PRIORITY ====================
  describe('updatePriority', () => {
    it('should update task priority', async () => {
      const updatedTask = { ...mockTask, priority: TaskPriority.LOW };
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockResolvedValue(updatedTask);

      const result = await service.updatePriority('task-123', TaskPriority.LOW);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        data: { priority: TaskPriority.LOW },
      });
      expect(result.priority).toBe(TaskPriority.LOW);
    });

    it('should throw NotFoundException for non-existent task', async () => {
      prisma.task.update.mockRejectedValue(new Error('Record not found'));

      await expect(
        service.updatePriority('invalid-id', TaskPriority.LOW),
      ).rejects.toThrow();
    });

    it('should validate priority value is valid enum', async () => {
      const validPriorities = [
        TaskPriority.HIGH,
        TaskPriority.MEDIUM,
        TaskPriority.LOW,
      ];

      prisma.task.findUnique.mockResolvedValue(mockTask);

      for (const priority of validPriorities) {
        prisma.task.update.mockResolvedValue({
          ...mockTask,
          priority,
        });

        const result = await service.updatePriority('task-123', priority);
        expect(result.priority).toBe(priority);
      }
    });

    it('should handle database errors during update', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updatePriority('task-123', TaskPriority.LOW),
      ).rejects.toThrow('Database error');
    });
  });

  // ==================== ASSIGN TASK ====================
  describe('assignTask', () => {
    it('should assign task to user', async () => {
      const assignedTask = { ...mockTask, assignedToId: 'user-123' };
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockResolvedValue(assignedTask);

      const result = await service.assignTask('task-123', 'user-123');

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        data: { assignedToId: 'user-123' },
      });
      expect(result.assignedToId).toBe('user-123');
    });

    it('should throw NotFoundException for non-existent task', async () => {
      prisma.task.update.mockRejectedValue(new Error('Task not found'));

      await expect(
        service.assignTask('invalid-task', 'user-123'),
      ).rejects.toThrow();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prisma.task.update.mockRejectedValue(new Error('User not found'));

      await expect(
        service.assignTask('task-123', 'invalid-user'),
      ).rejects.toThrow();
    });

    it('should handle database errors during assignment', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockRejectedValue(new Error('Database error'));

      await expect(service.assignTask('task-123', 'user-123')).rejects.toThrow(
        'Database error',
      );
    });
  });

  // ==================== FIND MY TASKS ====================
  describe('findMyTasks', () => {
    it('should find tasks assigned to user', async () => {
      const userTasks = [mockTaskWithUser, mockTaskInProgress];
      prisma.task.findMany.mockResolvedValue(userTasks);

      const result = await service.findMyTasks('user-uuid-001');

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { assignedToId: 'user-uuid-001' },
        orderBy: { priority: 'desc' },
        select: {
          id: true,
          title: true,
          priority: true,
          area: true,
          estimatedTime: true,
          status: true,
        },
      });
      expect(result).toEqual(userTasks);
    });

    it('should return empty array when user has no tasks', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      const result = await service.findMyTasks('user-without-tasks');

      expect(result).toEqual([]);
    });

    it('should order tasks by priority in descending order', async () => {
      const orderedTasks = [
        { ...mockTask, priority: TaskPriority.HIGH },
        { ...mockTask, priority: TaskPriority.MEDIUM },
        { ...mockTask, priority: TaskPriority.LOW },
      ];
      prisma.task.findMany.mockResolvedValue(orderedTasks);

      const result = await service.findMyTasks('user-123');

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { priority: 'desc' },
        }),
      );
      expect(result.length).toBe(3);
    });

    it('should handle database errors during retrieval', async () => {
      prisma.task.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.findMyTasks('user-123')).rejects.toThrow(
        'Database error',
      );
    });
  });

  // ==================== UPDATE STATUS ====================
  describe('updateStatus', () => {
    it('should update task status', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTaskWithUser);
      const updatedTask = { ...mockTaskWithUser, status: 'IN_PROGRESS' };
      prisma.task.update.mockResolvedValue(updatedTask);

      const result = await service.updateStatus(
        'task-123',
        'user-uuid-001',
        'IN_PROGRESS',
      );

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        data: { status: 'IN_PROGRESS' },
      });
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should throw NotFoundException for task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('invalid-id', 'user-123', 'IN_PROGRESS'),
      ).rejects.toThrow();
    });

    it('should throw ForbiddenException if user not assigned to task', async () => {
      prisma.task.findUnique.mockResolvedValue({
        ...mockTask,
        assignedToId: 'other-user',
      });

      await expect(
        service.updateStatus('task-123', 'wrong-user', 'IN_PROGRESS'),
      ).rejects.toThrow('You cannot modify this task');
    });

    it('should handle database errors during status update', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTaskWithUser);
      prisma.task.update.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateStatus('task-123', 'user-uuid-001', 'IN_PROGRESS'),
      ).rejects.toThrow('Database error');
    });
  });
});
