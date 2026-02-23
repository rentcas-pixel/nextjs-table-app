'use client'

import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ClientData {
  id: string
  name: string
  status: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'
  startDate: string
  orderNumber?: string
}

interface ReservedClientsWarningModalProps {
  open: boolean
  onClose: () => void
  clients: ClientData[]
}

export default function ReservedClientsWarningModal({ open, onClose, clients }: ReservedClientsWarningModalProps) {
  if (!open) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filtruoti "Rezervuota" klientus, kuriems iki starto liko ≤21 diena
  const warningClients = clients
    .filter(client => {
      if (client.status !== 'Rezervuota' || !client.startDate) return false
      
      const start = new Date(client.startDate)
      start.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return diffDays >= 0 && diffDays <= 21
    })
    .map(client => {
      const start = new Date(client.startDate)
      start.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...client,
        daysLeft: diffDays
      }
    })
    .sort((a, b) => a.daysLeft - b.daysLeft) // Rūšiuoti pagal dienų skaičių (mažiausias pirmas)

  if (warningClients.length === 0) return null

  const getDaysText = (days: number) => {
    if (days === 0) return 'šiandien'
    if (days === 1) return '1 dieną'
    if (days >= 2 && days <= 9) return `${days} dienas`
    return `${days} dienų`
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'text-red-600 bg-red-50 border-red-200'
    if (days <= 14) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Rezervuotų kampanijų perspėjimas
              </h3>
              <div className="text-sm text-gray-600 mt-0.5">
                {warningClients.length} kampanij{warningClients.length === 1 ? 'a' : 'os'} prasidės per ≤21 dieną
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors"
            aria-label="Uždaryti"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-3">
            {warningClients.map((client) => (
              <div
                key={client.id}
                className={`p-4 rounded-lg border-2 ${getUrgencyColor(client.daysLeft)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg mb-1 truncate">
                      {client.name}
                    </div>
                    {client.orderNumber && (
                      <div className="text-sm opacity-75 mb-2">
                        Užsakymo Nr.: {client.orderNumber}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium">
                        Kampanija prasidės per: <strong>{getDaysText(client.daysLeft)}</strong>
                      </span>
                      {client.daysLeft === 0 && (
                        <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded">
                          ŠIANDIEN!
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-1 opacity-75">
                      Pradžios data: {new Date(client.startDate).toLocaleDateString('lt-LT')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Supratau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
