import { IsIn } from 'class-validator';
import { TaskArea } from '@prisma/client';

export class FilterTaskByAreaDto {
  @IsIn(Object.values(TaskArea), {
    message: 'Área inválida',
  })
  area: TaskArea;
}
