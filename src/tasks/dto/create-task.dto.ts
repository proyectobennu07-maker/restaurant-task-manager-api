import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { TaskPriority } from '../enums/task-priority.enum';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;
}
