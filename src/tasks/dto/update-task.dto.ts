import { IsEnum, IsOptional } from 'class-validator';
import { TaskPriority } from '../enums/task-priority.enum';

export class UpdateTaskDto {
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
