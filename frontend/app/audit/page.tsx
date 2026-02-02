'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { FileText, Filter } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  entityType: string | null
  entityId: string | null
  details: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('ALL')

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, filterAction])

  const loadLogs = async () => {
    try {
      const response = await api.get('/audit?take=200')
      setLogs(response.data)
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    if (filterAction === 'ALL') {
      setFilteredLogs(logs)
    } else {
      setFilteredLogs(logs.filter((log) => log.action === filterAction))
    }
  }

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      LOGIN: '🔐 Inicio de sesión',
      LOGOUT: '🚪 Cierre de sesión',
      CREATE_TASK: '➕ Crear tarea',
      UPDATE_TASK: '✏️ Actualizar tarea',
      DELETE_TASK: '🗑️ Eliminar tarea',
      CREATE_USER: '👤 Crear usuario',
      UPDATE_USER: '✏️ Actualizar usuario',
      DELETE_USER: '🗑️ Eliminar usuario',
      CREATE_CALENDAR_EVENT: '📅 Crear evento',
      UPDATE_CALENDAR_EVENT: '✏️ Actualizar evento',
      DELETE_CALENDAR_EVENT: '🗑️ Eliminar evento',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800'
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800'
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800'
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
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

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)))

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bitácora</h1>
          <p className="mt-2 text-gray-600">
            Registro de todas las actividades del sistema
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acción
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">Todas</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {getActionLabel(action)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de logs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No hay registros que mostrar
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.user.firstName} {log.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{log.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.entityType && (
                          <div>
                            <div className="font-medium">{log.entityType}</div>
                            {log.entityId && (
                              <div className="text-xs text-gray-400">{log.entityId.substring(0, 8)}...</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="cursor-pointer">
                            <summary className="text-primary-600 hover:text-primary-800">
                              Ver detalles
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-md">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                        {log.ipAddress && (
                          <div className="text-xs text-gray-400 mt-1">
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

