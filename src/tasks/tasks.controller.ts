import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt-auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/jwt-auth/guards/roles.guard';
import { TasksService } from './tasks.service';
import { MemberRole } from 'src/generated/prisma/enums';
import { Roles } from 'src/jwt-auth/decorators/roles.decorator';
import { LoggedUser } from 'src/users/decorators/logged-user.decorator';
import { CreateTaskDto } from './dto/create-task-dto';
import { UpdateTaskDto } from './dto/update-task-dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/projects/:projectId/tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
  @Post()
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async createTask(
    @LoggedUser('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return await this.tasksService.create(userId, dto, workspaceId);
  }
  @Get()
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get all tasks in project' })
  @ApiParam({ name: 'projectId', description: 'ID of the project' })
  async getTasks(@Param('projectId') projectId: string) {
    const tasks = await this.tasksService.getAll(projectId);

    return tasks;
  }
  @Get(':taskId')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiParam({ name: 'taskId', description: 'ID of the task' })
  async getTask(@Param('taskId') taskId: string) {
    return await this.tasksService.get(taskId);
  }
  @Delete('')
  @HttpCode(HttpStatus.OK)
  async deleteMany(
    @LoggedUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body('ids') ids: string[],
  ) {
    return this.tasksService.deleteMany(ids, userId, projectId);
  }

  @Delete(':taskId')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'taskId', description: 'ID of the task' })
  async deleteTask(
    @Param('taskId') taskId: string,
    @LoggedUser('userId') userId: string,
  ) {
    return await this.tasksService.delete(userId, taskId);
  }

  @Patch(':taskId')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({ summary: 'Update task info' })
  @ApiParam({ name: 'taskId', description: 'ID of the task' })
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
    @LoggedUser('userId') userId: string,
  ) {
    return await this.tasksService.update(userId, taskId, dto);
  }
}
