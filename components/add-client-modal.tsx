'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export interface NewClientForm {
  name: string
  status: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'
  orderNumber: string
  startDate: string
  endDate: string
  intensity: string
}

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (form: NewClientForm) => boolean
}

const defaultForm: NewClientForm = {
  name: '',
  status: 'Patvirtinta',
  orderNumber: '',
  startDate: '',
  endDate: '',
  intensity: 'kas 4 (25%)'
}

export default function AddClientModal({ open, onOpenChange, onAdd }: AddClientModalProps) {
  const [form, setForm] = useState<NewClientForm>(defaultForm)

  useEffect(() => {
    if (open) {
      setForm(defaultForm)
    }
  }, [open])

  const getTodayString = () => new Date().toISOString().split('T')[0]

  const handleFormChange = (field: keyof NewClientForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!form.name || !form.orderNumber || !form.startDate || !form.endDate) {
      alert('Prašome užpildyti visus privalomus laukus')
      return
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      alert('Pabaigos data turi būti po pradžios datos')
      return
    }

    const success = onAdd(form)
    if (success) handleClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="absolute inset-0 flex items-start md:items-center justify-center overflow-y-auto p-4">
        <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Pridėti klientą</h3>
            <button aria-label="Uždaryti" className="p-2 text-gray-500 hover:text-gray-700" onClick={handleClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pavadinimas *</label>
                <input
                  type="text"
                  placeholder="Įveskite kliento pavadinimą"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statusas</label>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                >
                  <option value="Patvirtinta">Patvirtinta</option>
                  <option value="Rezervuota">Rezervuota</option>
                  <option value="Atšaukta">Atšaukta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Užsakymo Nr. *</label>
                <input
                  type="text"
                  placeholder="Įveskite užsakymo numerį"
                  value={form.orderNumber}
                  onChange={(e) => handleFormChange('orderNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intensyvumas</label>
                <select
                  value={form.intensity}
                  onChange={(e) => handleFormChange('intensity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                >
                  <option value="kas 4 (25%)">Kas 4</option>
                  <option value="kas 2 (50%)">Kas 2</option>
                  <option value="kas 1 (100%)">Kas 1</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data nuo *</label>
                <input
                  type="date"
                  lang="en-CA"
                  value={form.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                  min={getTodayString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data iki *</label>
                <input
                  type="date"
                  lang="en-CA"
                  value={form.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                  min={form.startDate || getTodayString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Pridėti
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Atšaukti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
