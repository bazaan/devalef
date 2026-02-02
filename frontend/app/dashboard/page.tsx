'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { 
  CheckSquare, 
  Clock, 
  Users, 
  AlertCircle,
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react'
import { formatDate, isOverdue } from '@/lib/utils'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
}

interface Stats {
  pending: number
  inProgress: number
  completed: number
  total: number
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/tasks/upcoming?days=7'),
      ])

      setStats(statsRes.data)
      setUpcomingTasks(tasksRes.data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
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

  const overdueTasks = upcomingTasks.filter((task) => 
    task.dueDate && isOverdue(task.dueDate) && task.status !== 'COMPLETED'
  )

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Bienvenido, {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total || 0}</p>
              </div>
              <CheckSquare className="h-12 w-12 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pending || 0}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.inProgress || 0}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.completed || 0}</p>
              </div>
              <CheckSquare className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tareas próximas a vencer */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Tareas Próximas</h2>
              <Link href="/tasks" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver todas →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay tareas próximas</p>
            ) : (
              <div className="space-y-4">
                {upcomingTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      isOverdue(task.dueDate) && task.status !== 'COMPLETED'
                        ? 'border-red-500 bg-red-50'
                        : 'border-primary-500 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        {task.dueDate && (
                          <p className="text-sm text-gray-600 mt-1">
                            Vence: {formatDate(task.dueDate)}
                            {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                              <span className="ml-2 text-red-600 font-semibold">⚠️ Vencida</span>
                            )}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alertas de tareas vencidas */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900">
                  {overdueTasks.length} tarea(s) vencida(s)
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Tienes tareas que han pasado su fecha límite
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

