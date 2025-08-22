import { useState, useEffect } from 'react'
import { X, Check, Clock } from 'lucide-react'

interface Reminder {
  id: string
  clientId: string
  remindAt: string
  message: string
  status?: string
  shownToday?: boolean
  lastShown?: string
}

interface RemindersPopupProps {
  reminders: Reminder[]
  clients: Array<{ id: string; name: string }>
  onClose: () => void
  onMarkCompleted: (reminderId: string) => void
}

export default function RemindersPopup({ reminders, clients, onClose, onMarkCompleted }: RemindersPopupProps) {
  const [isVisible, setIsVisible] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  
  // Filtruoti tik šiandienos aktyvius priminimus
  const todaysReminders = reminders.filter(r => 
    r.remindAt === today && 
    (r.status === 'active' || !r.status) && 
    !r.shownToday
  )

  const handleClose = () => {
    setIsVisible(false)
    onClose()
  }

  const handleMarkCompleted = (reminderId: string) => {
    onMarkCompleted(reminderId)
    setIsVisible(false)
    onClose()
  }

  if (!isVisible || todaysReminders.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Šiandienos priminimai
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {todaysReminders.map((reminder) => {
            const client = clients.find(c => c.id === reminder.clientId)
            return (
              <div key={reminder.id} className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-orange-800 mb-1">
                      {client?.name || `Klientas ${reminder.clientId}`}
                    </div>
                    <div className="text-sm text-orange-700">
                      {reminder.message}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Priminimas: {reminder.remindAt}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkCompleted(reminder.id)}
                    className="ml-2 p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded"
                    title="Pažymėti kaip atliktą"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  )
}
