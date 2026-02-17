import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateTaskDto } from './dto/create-task-dto';
import { UpdateTaskDto } from './dto/update-task-dto';

@Injectable()
export class TasksService {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: string, dto: CreateTaskDto, workspaceId: string) {
    if (!userId || !dto) throw new BadRequestException('Invalid data');
    return await this.db.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        workspace: { connect: { id: workspaceId } },
        project: { connect: { id: dto.projectId } },
        author: { connect: { id: userId } },
        ...(dto.assigneeId && {
          assignee: { connect: { id: dto.assigneeId } },
        }),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        assignee: {
          select: {
            name: true,
          },
        },
      },
    });
  }
  async getAll(projectId: string) {
    if (!projectId) throw new BadRequestException('Project id not provided');
    return await this.db.task.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }
  async get(taskId: string) {
    if (!taskId) throw new BadRequestException('Task id not provided');
    const task = await this.db.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return task;
  }
  async delete(userId: string, taskId: string) {
    const task = await this.db.task.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Task not found');
    const isAuthor = task.authorId === userId;
    if (!isAuthor) {
      throw new ForbiddenException('Only the author can delete this task');
    }
    return await this.db.task.delete({
      where: { id: taskId },
    });
  }

  async deleteMany(ids: string[], userId: string, projectId: string) {
    const result = await this.db.task.deleteMany({
      where: {
        id: { in: ids },
        projectId: projectId,
        authorId: userId,
      },
    });

    if (result.count === 0) {
      return { message: 'No tasks were deleted (you might not be the author)' };
    }

    return { count: result.count };
  }
  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.db.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    const isAuthor = task.authorId === userId;
    const isAssignee = task.assigneeId === userId;
    if (!isAuthor && !isAssignee) {
      throw new ForbiddenException(
        'You do not have permission to update this task',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { assigneeId, projectId, ...restDto } = dto;

    return await this.db.task.update({
      where: { id: taskId },
      data: {
        ...restDto,
        dueDate: restDto.dueDate ? new Date(restDto.dueDate) : undefined,

        ...(assigneeId !== undefined && {
          assignee: assigneeId
            ? { connect: { id: assigneeId } }
            : { disconnect: true },
        }),
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }
}
