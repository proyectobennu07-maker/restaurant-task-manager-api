import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        estimatedTime: createTaskDto.estimatedTime,
      },
    });
  }

  findAll(): Promise<Task[]> {
    return this.prisma.task.findMany();
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
