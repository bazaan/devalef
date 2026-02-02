import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        creatorId: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.auditService.log({
      userId,
      action: 'CREATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      details: { title: task.title, priority: task.priority },
    });

    return task;
  }

  async findAll(userId: string, userRole: string) {
    const where: any = {};

    // Desarrolladores solo ven sus tareas asignadas
    if (userRole === 'DEVELOPER') {
      where.assigneeId = userId;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Desarrolladores solo pueden ver sus tareas asignadas
    if (userRole === 'DEVELOPER' && task.assigneeId !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta tarea');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: string) {
    const task = await this.findOne(id, userId, userRole);

    // Desarrolladores solo pueden actualizar estado de sus tareas
    if (userRole === 'DEVELOPER') {
      if (task.assigneeId !== userId) {
        throw new ForbiddenException('No tienes permiso para editar esta tarea');
      }

      // Solo permitir cambiar estado
      const allowedFields = ['status'];
      const updateKeys = Object.keys(updateTaskDto);
      const hasUnauthorizedFields = updateKeys.some(
        (key) => !allowedFields.includes(key),
      );

      if (hasUnauthorizedFields) {
        throw new ForbiddenException('Solo puedes cambiar el estado de la tarea');
      }
    }

    const oldTask = { ...task };
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Registrar cambios en bitácora
    const changes: any = {};
    Object.keys(updateTaskDto).forEach((key) => {
      if (oldTask[key] !== updatedTask[key]) {
        changes[key] = {
          from: oldTask[key],
          to: updatedTask[key],
        };
      }
    });

    await this.auditService.log({
      userId,
      action: 'UPDATE_TASK',
      entityType: 'Task',
      entityId: id,
      details: changes,
    });

    return updatedTask;
  }

  async remove(id: string, userId: string, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden eliminar tareas');
    }

    await this.findOne(id, userId, userRole);

    await this.prisma.task.delete({
      where: { id },
    });

    await this.auditService.log({
      userId,
      action: 'DELETE_TASK',
      entityType: 'Task',
      entityId: id,
    });

    return { message: 'Tarea eliminada exitosamente' };
  }

  async getTasksByStatus(userId: string, userRole: string) {
    const where: any = {};

    if (userRole === 'DEVELOPER') {
      where.assigneeId = userId;
    }

    const tasks = await this.prisma.task.findMany({ where });

    return {
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      total: tasks.length,
    };
  }

  async getUpcomingTasks(userId: string, userRole: string, days: number = 7) {
    const where: any = {
      dueDate: {
        gte: new Date(),
        lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
      status: {
        not: 'COMPLETED',
      },
    };

    if (userRole === 'DEVELOPER') {
      where.assigneeId = userId;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}

