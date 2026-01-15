import { IsEnum } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class UpdateTaskPriorityDto {
  @IsEnum(TaskPriority)
  priority: TaskPriority;
}
