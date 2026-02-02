import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CalendarService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(createEventDto: CreateCalendarEventDto, userId: string) {
    const event = await this.prisma.calendarEvent.create({
      data: {
        ...createEventDto,
        createdById: userId,
      },
      include: {
        createdBy: {
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
      action: 'CREATE_CALENDAR_EVENT',
      entityType: 'CalendarEvent',
      entityId: event.id,
      details: { title: event.title, eventType: event.eventType },
    });

    return event;
  }

  async findAll(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate && endDate) {
      where.OR = [
        {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          endDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          AND: [
            { startDate: { lte: new Date(startDate) } },
            { endDate: { gte: new Date(endDate) } },
          ],
        },
      ];
    }

    return this.prisma.calendarEvent.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateCalendarEventDto, userId: string) {
    await this.findOne(id);

    const updatedEvent = await this.prisma.calendarEvent.update({
      where: { id },
      data: updateEventDto,
      include: {
        createdBy: {
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
      action: 'UPDATE_CALENDAR_EVENT',
      entityType: 'CalendarEvent',
      entityId: id,
      details: updateEventDto,
    });

    return updatedEvent;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.calendarEvent.delete({
      where: { id },
    });

    await this.auditService.log({
      userId,
      action: 'DELETE_CALENDAR_EVENT',
      entityType: 'CalendarEvent',
      entityId: id,
    });

    return { message: 'Evento eliminado exitosamente' };
  }

  async getEventsByType(eventType: string, startDate?: string, endDate?: string) {
    const where: any = { eventType };

    if (startDate && endDate) {
      where.OR = [
        {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          endDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      ];
    }

    return this.prisma.calendarEvent.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }
}

