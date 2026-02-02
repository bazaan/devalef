import { IsString, IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsDateString()
  @IsOptional()
  devStartDate?: string;

  @IsDateString()
  @IsOptional()
  devEndDate?: string;

  @IsDateString()
  @IsOptional()
  testingStartDate?: string;
}

