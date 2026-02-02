import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCalendarEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  eventType: string; // "DEVELOPMENT" | "DELIVERY" | "MILESTONE" | "BLOCKER"

  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;
}

