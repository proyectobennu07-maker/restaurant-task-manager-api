import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskPriorityDto } from './dto/update-task-priority.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('SUPERVISOR', 'ADMIN')
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @Roles('SUPERVISOR', 'ADMIN')
  findAll() {
    return this.tasksService.findAll();
  }

  @Patch(':id/priority')
  @Roles('SUPERVISOR', 'ADMIN')
  updatePriority(@Param('id') id: string, @Body() dto: UpdateTaskPriorityDto) {
    return this.tasksService.updatePriority(id, dto.priority);
  }
}
