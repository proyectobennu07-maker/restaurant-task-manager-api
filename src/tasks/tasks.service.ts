import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Prisma, Task, TaskArea } from '@prisma/client';
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto): Promise<Task> {
    const data = Prisma.validator<Prisma.TaskCreateInput>()({
      title: createTaskDto.title,
      description: createTaskDto.description ?? null,
      priority: createTaskDto.priority,
      estimatedTime: createTaskDto.estimatedTime ?? null,
      area: createTaskDto.area,
    });

    return this.prisma.task.create({ data });
  }

  findAll(): Promise<Task[]> {
    return this.prisma.task.findMany();
  }

  findByArea(area: TaskArea): Promise<Task[]> {
    const where = Prisma.validator<Prisma.TaskWhereInput>()({
      area,
    });

    return this.prisma.task.findMany({ where });
  }

  async updatePriority(id: string, priority: Task['priority']): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: { priority },
    });
  }
}
