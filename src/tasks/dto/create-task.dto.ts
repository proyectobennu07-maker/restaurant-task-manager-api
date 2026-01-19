import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { TaskArea } from '@prisma/client';
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

  @IsIn(Object.values(TaskArea), {
    message: 'Área inválida',
  })
  area: TaskArea;
}
