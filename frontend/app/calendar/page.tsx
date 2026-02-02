'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import CalendarModal from '@/components/CalendarModal'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  eventType: string
  isBlocked: boolean
  createdBy: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function CalendarPage() {
  const { isAdmin } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [viewType, setViewType] = useState<'all' | 'development' | 'delivery'>('all')

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, viewType])

  const loadEvents = async () => {
    try {
      const response = await api.get('/calendar')
      setEvents(response.data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    if (viewType === 'all') {
      setFilteredEvents(events)
    } else if (viewType === 'development') {
      setFilteredEvents(events.filter((e) => e.eventType === 'DEVELOPMENT'))
    } else if (viewType === 'delivery') {
      setFilteredEvents(events.filter((e) => e.eventType === 'DELIVERY'))
    }
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setShowModal(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
    loadEvents()
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return

    try {
      await api.delete(`/calendar/${id}`)
      loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error al eliminar el evento')
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'DEVELOPMENT':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELIVERY':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'MILESTONE':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'BLOCKER':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'DEVELOPMENT':
        return 'Desarrollo'
      case 'DELIVERY':
        return 'Entrega'
      case 'MILESTONE':
        return 'Hito'
      case 'BLOCKER':
        return 'Bloqueo'
      default:
        return type
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
            <h1 className="text-3xl font-bold text-gray-900">Calendarios</h1>
            <p className="mt-2 text-gray-600">
              Calendario de desarrollo y entregas
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateEvent}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Evento
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <div className="flex space-x-2">
              <button
                onClick={() => setViewType('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewType === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setViewType('development')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewType === 'development'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Desarrollo
              </button>
              <button
                onClick={() => setViewType('delivery')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewType === 'delivery'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Entregas
              </button>
            </div>
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {filteredEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay eventos que mostrar</p>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border-l-4 ${getEventTypeColor(event.eventType)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-gray-900">{event.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventTypeColor(event.eventType)}`}>
                            {getEventTypeLabel(event.eventType)}
                          </span>
                          {event.isBlocked && (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                              Bloqueado
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          <p>
                            📅 Inicio: {formatDateTime(event.startDate)}
                          </p>
                          {event.endDate && (
                            <p>
                              📅 Fin: {formatDateTime(event.endDate)}
                            </p>
                          )}
                          <p className="mt-1">
                            Creado por: {event.createdBy.firstName} {event.createdBy.lastName}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CalendarModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onSave={loadEvents}
        />
      )}
    </Layout>
  )
}

