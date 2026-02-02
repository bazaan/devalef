import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'HIGH':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'MEDIUM':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'LOW':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'IN_PROGRESS':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'COMPLETED':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'HIGH':
      return '🔴 Alta'
    case 'MEDIUM':
      return '🟠 Media'
    case 'LOW':
      return '🟢 Leve'
    default:
      return priority
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return '⏳ Pendiente'
    case 'IN_PROGRESS':
      return '🛠️ En proceso'
    case 'COMPLETED':
      return '✅ Terminada'
    default:
      return status
  }
}

export function isOverdue(dueDate: string | Date | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

