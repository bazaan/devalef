'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Plus, Filter } from 'lucide-react'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import { getPriorityLabel, getStatusLabel } from '@/lib/utils'

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

export default function TasksPage() {
  const { isAdmin } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, filterPriority, filterStatus])

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks')
      setTasks(response.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = [...tasks]

    if (filterPriority !== 'ALL') {
      filtered = filtered.filter((task) => task.priority === filterPriority)
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((task) => task.status === filterStatus)
    }

    // Ordenar por prioridad, fecha límite y estado
    filtered.sort((a, b) => {
      const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 }
      const statusOrder = { PENDING: 1, IN_PROGRESS: 2, COMPLETED: 3 }

      if (priorityOrder[a.priority as keyof typeof priorityOrder] !== priorityOrder[b.priority as keyof typeof priorityOrder]) {
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1

      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
    })

    setFilteredTasks(filtered)
  }

  const handleCreateTask = () => {
    setSelectedTask(null)
    setShowModal(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedTask(null)
    loadTasks()
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return

    try {
      await api.delete(`/tasks/${id}`)
      loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error al eliminar la tarea')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
            <p className="mt-2 text-gray-600">
              Vista "océano" - Organización visual de tareas
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateTask}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Tarea
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="ALL">Todas</option>
                  <option value="HIGH">🔴 Alta</option>
                  <option value="MEDIUM">🟠 Media</option>
                  <option value="LOW">🟢 Leve</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="ALL">Todos</option>
                  <option value="PENDING">⏳ Pendiente</option>
                  <option value="IN_PROGRESS">🛠️ En proceso</option>
                  <option value="COMPLETED">✅ Terminada</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vista "océano" de tareas */}
        <div className="ocean-view">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No hay tareas que mostrar</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={isAdmin ? handleEditTask : undefined}
                onDelete={isAdmin ? handleDeleteTask : undefined}
                onStatusChange={loadTasks}
              />
            ))
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={selectedTask}
          onClose={handleCloseModal}
          onSave={loadTasks}
        />
      )}
    </Layout>
  )
}

