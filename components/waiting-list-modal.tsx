'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { fetchWaitingList, upsertWaitingListClient, deleteWaitingListClient, WaitingListClient } from '../lib/supabase'

interface WaitingListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function WaitingListModal({ open, onOpenChange }: WaitingListModalProps) {
  const [clients, setClients] = useState<WaitingListClient[]>([])
  const [newClient, setNewClient] = useState<Omit<WaitingListClient, 'id'>>({
    name: '',
    desiredPeriod: '',
    notes: ''
  })

  // Load waiting list data when modal opens
  useEffect(() => {
    if (open) {
      loadWaitingList()
    }
  }, [open])

  const loadWaitingList = async () => {
    try {
      const data = await fetchWaitingList()
      setClients(data)
    } catch (error) {
      console.error('Error loading waiting list:', error)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleAddClient = async () => {
    if (!newClient.name) {
      alert('Prašome užpildyti kliento pavadinimą')
      return
    }

    const client: WaitingListClient = {
      id: `wl-${Date.now()}`,
      ...newClient
    }

    try {
      await upsertWaitingListClient(client)
      setClients(prev => [...prev, client])
      setNewClient({
        name: '',
        desiredPeriod: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error adding client to waiting list:', error)
      alert('Klaida pridedant klientą į waiting listą')
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteWaitingListClient(id)
      setClients(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting client from waiting list:', error)
      alert('Klaida ištrinant klientą iš waiting listo')
    }
  }

  const handleFormChange = (field: 'name' | 'desiredPeriod' | 'notes', value: string) => {
    setNewClient(prev => ({ ...prev, [field]: value }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="absolute inset-0 flex items-start md:items-center justify-center overflow-y-auto">
        <div className="bg-white w-full md:max-w-4xl md:my-10 rounded-lg shadow-lg border border-gray-200 mx-auto">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Waiting List</h3>
                <div className="text-sm text-gray-500 mt-0.5">Klientai, kurie laukia vietos</div>
              </div>
              <button aria-label="Close" className="p-2 text-gray-500 hover:text-gray-700" onClick={handleClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Add New Client Form */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                             <h4 className="text-lg font-medium text-gray-900 mb-4">Pridėti naują klientą į waiting listą</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kliento pavadinimas *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Įveskite kliento pavadinimą"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Norimas periodas</label>
                  <input
                    type="text"
                    value={newClient.desiredPeriod}
                    onChange={(e) => handleFormChange('desiredPeriod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pvz.: W-45, W-46"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pastabos</label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Papildoma informacija..."
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={handleAddClient}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    + Pridėti į Waiting List
                  </button>
                </div>
              </div>
            </div>

            {/* Waiting List Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Pavadinimas</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Norimas periodas</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Pastabos</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Veiksmai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{client.desiredPeriod || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={client.notes}>
                        {client.notes || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="px-3 py-1 text-sm rounded border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Ištrinti
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Waiting listas tuščias. Pridėkite pirmą klientą!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
