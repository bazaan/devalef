'use client'

import { useState } from 'react'
import { Edit, Trash2, User } from 'lucide-react'
import { formatDate, getPriorityColor, getStatusColor, getPriorityLabel, getStatusLabel, isOverdue } from '@/lib/utils'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: string | null
  assignee: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  creator: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
  onStatusChange?: () => void
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const { user, isAdmin } = useAuth()
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (task.status === newStatus) return

    setUpdating(true)
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus })
      onStatusChange?.()
    } catch (error) {
      console.error('Error updating task status:', error)
      alert('Error al actualizar el estado')
    } finally {
      setUpdating(false)
    }
  }

  const canEdit = isAdmin || (task.assignee?.id === user?.id)

  return (
    <div
      className={`task-card priority-${task.priority.toLowerCase()} status-${task.status.toLowerCase()}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex space-x-1 ml-2">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
        </div>

        {task.dueDate && (
          <div className={`text-xs ${isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            📅 {formatDate(task.dueDate)}
            {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && ' ⚠️'}
          </div>
        )}

        {task.assignee && (
          <div className="flex items-center text-xs text-gray-600">
            <User className="h-3 w-3 mr-1" />
            {task.assignee.firstName} {task.assignee.lastName}
          </div>
        )}

        {canEdit && task.status !== 'COMPLETED' && (
          <div className="pt-2 border-t border-gray-200">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="PENDING">⏳ Pendiente</option>
              <option value="IN_PROGRESS">🛠️ En proceso</option>
              <option value="COMPLETED">✅ Terminada</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

