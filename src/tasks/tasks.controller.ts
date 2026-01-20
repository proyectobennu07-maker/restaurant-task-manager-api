import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskPriorityDto } from './dto/update-task-priority.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilterTaskByAreaDto } from './dto/filter-task-area.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

interface AuthRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

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

  @Get('by-area')
  @Roles('SUPERVISOR', 'ADMIN')
  findByArea(@Query() query: FilterTaskByAreaDto) {
    return this.tasksService.findByArea(query.area);
  }

  @Patch(':id/priority')
  @Roles('SUPERVISOR', 'ADMIN')
  updatePriority(@Param('id') id: string, @Body() dto: UpdateTaskPriorityDto) {
    return this.tasksService.updatePriority(id, dto.priority);
  }

  @Get('my-tasks')
  @Roles('COLABORADOR')
  findMyTasks(@Req() req: AuthRequest) {
    return this.tasksService.findMyTasks(req.user.sub);
  }

  @Patch(':id/assign')
  @Roles('SUPERVISOR', 'ADMIN')
  assignTask(@Param('id') taskId: string, @Body() dto: AssignTaskDto) {
    return this.tasksService.assignTask(taskId, dto.userId);
  }

  @Patch(':id/status')
  @Roles('COLABORADOR')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @Req() req: AuthRequest,
  ) {
    return this.tasksService.updateStatus(id, req.user.sub, dto.status);
  }
}
