'use client'

import React, { useState, useMemo, useEffect } from 'react'
import TaskDetailModal from './task-detail-modal'
import { generateWeeks, getCurrentWeekStart, WeekData, generateWeekValues } from '../lib/utils'

interface ClientData {
  id: string
  name: string
  status: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'
  orderNumber: string
  startDate: string
  endDate: string
  intensity: string
  weeks: { [weekId: string]: number }
  hasWarning?: boolean
  comment?: string
  files?: { name: string; size: number }[]
}

interface NewClientForm {
  name: string
  status: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'
  orderNumber: string
  startDate: string
  endDate: string
  intensity: string
}

interface Reminder {
  id: string
  clientId: string
  message: string
  remindAt: string // YYYY-MM-DD
}

const DEFAULT_CLIENTS: ClientData[] = [
  {
    id: '1',
    name: 'Airnaras',
    status: 'Patvirtinta',
    orderNumber: 'ORD-001',
    startDate: '2025-08-18',
    endDate: '2025-08-24',
    intensity: 'kas 1 (100%)',
    weeks: {},
    comment: ''
  },
  {
    id: '2',
    name: 'Artūras',
    status: 'Rezervuota',
    orderNumber: 'ORD-002',
    startDate: '2025-08-25',
    endDate: '2025-09-07',
    intensity: 'kas 2 (50%)',
    weeks: {},
    hasWarning: true,
    comment: ''
  },
  {
    id: '3',
    name: 'Aivaras ženklų salis',
    status: 'Patvirtinta',
    orderNumber: 'ORD-003',
    startDate: '2025-09-08',
    endDate: '2025-09-21',
    intensity: 'kas 4 (25%)',
    weeks: {},
    hasWarning: true,
    comment: ''
  },
  {
    id: '4',
    name: 'Akropolis',
    status: 'Patvirtinta',
    orderNumber: 'ORD-004',
    startDate: '2025-08-18',
    endDate: '2025-08-31',
    intensity: 'kas 1 (100%)',
    weeks: {},
    comment: ''
  },
  {
    id: '5',
    name: 'Aivaras',
    status: 'Rezervuota',
    orderNumber: 'ORD-005',
    startDate: '2025-09-01',
    endDate: '2025-09-14',
    intensity: 'kas 2 (50%)',
    weeks: {},
    hasWarning: true,
    comment: ''
  }
]

export default function ResourceTable() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ClientData | null>(null)
  const [clients, setClients] = useState<ClientData[]>(DEFAULT_CLIENTS)

  const [newClientForm, setNewClientForm] = useState<NewClientForm>({
    name: '',
    status: 'Patvirtinta',
    orderNumber: '',
    startDate: '',
    endDate: '',
    intensity: 'kas 1 (100%)'
  })

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Reminders managed from modal
  const [reminders, setReminders] = useState<Reminder[]>([])
  const saveReminder = (clientId: string, remindAt: string, message: string) => {
    setReminders(prev => {
      // remove if empty date
      if (!remindAt) {
        return prev.filter(r => r.clientId !== clientId)
      }
      const existing = prev.find(r => r.clientId === clientId)
      if (existing) {
        return prev.map(r => r.clientId === clientId ? { ...r, remindAt, message } : r)
      }
      return [...prev, { id: `r-${clientId}-${Date.now()}`, clientId, remindAt, message }]
    })
  }
  const getReminder = (clientId: string) => reminders.find(r => r.clientId === clientId)

  const [hydrated, setHydrated] = useState(false)
  // Load persisted data on mount (avoid SSR mismatch)
  useEffect(() => {
    try {
      const storedClients = localStorage.getItem('viadukai.clients')
      if (storedClients) {
        const parsed = JSON.parse(storedClients)
        if (Array.isArray(parsed)) setClients(parsed)
      }
    } catch {}
    try {
      const storedReminders = localStorage.getItem('viadukai.reminders')
      if (storedReminders) {
        const parsed = JSON.parse(storedReminders)
        if (Array.isArray(parsed)) setReminders(parsed)
      }
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem('viadukai.clients', JSON.stringify(clients)) } catch {}
  }, [clients, hydrated])
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem('viadukai.reminders', JSON.stringify(reminders)) } catch {}
  }, [reminders, hydrated])

  const saveClientDetails = (update: {
    id: string
    name?: string
    status?: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'
    orderNumber?: string
    intensity?: string
    comment?: string
    files?: { name: string; size: number }[]
  }) => {
    const normalizeIntensity = (val?: string) => {
      if (!val) return undefined
      const v = val.toLowerCase()
      if (v.includes('kas 1')) return 'kas 1 (100%)'
      if (v.includes('kas 2')) return 'kas 2 (50%)'
      if (v.includes('kas 4')) return 'kas 4 (25%)'
      return val
    }
    setClients(prev => {
      const next = prev.map(c => c.id === update.id ? {
        ...c,
        name: update.name ?? c.name,
        status: update.status ?? c.status,
        orderNumber: update.orderNumber ?? c.orderNumber,
        intensity: normalizeIntensity(update.intensity) ?? c.intensity,
        comment: update.comment ?? c.comment,
        files: update.files ?? c.files
      } : c)
      try { localStorage.setItem('viadukai.clients', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const deleteClient = (clientId: string) => {
    setClients(prev => {
      const next = prev.filter(c => c.id !== clientId)
      try { localStorage.setItem('viadukai.clients', JSON.stringify(next)) } catch {}
      return next
    })
    setReminders(prev => {
      const next = prev.filter(r => r.clientId !== clientId)
      try { localStorage.setItem('viadukai.reminders', JSON.stringify(next)) } catch {}
      return next
    })
    setIsModalOpen(false)
  }

  // ticker for due calculation
  const [nowTick, setNowTick] = useState<number>(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 60000)
    return () => clearInterval(t)
  }, [])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [nowTick])
  const dueReminders = useMemo(() => reminders.filter(r => r.remindAt && r.remindAt <= todayStr), [reminders, todayStr])

  // Auto generuojamos savaitės
  const weeks = useMemo(() => {
    const currentWeekStart = getCurrentWeekStart()
    return generateWeeks(currentWeekStart, 20) // 20 savaičių
  }, [])

  // Automatiškai skaičiuoti savaičių reikšmes pagal datas ir intensyvumą
  const clientsWithCalculatedWeeks = useMemo(() => {
    return clients.map(client => ({
      ...client,
      weeks: generateWeekValues(client.startDate, client.endDate, client.intensity, weeks)
    }))
  }, [clients, weeks])

  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return clientsWithCalculatedWeeks
    return clientsWithCalculatedWeeks.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.orderNumber.toLowerCase().includes(q)
    )
  }, [clientsWithCalculatedWeeks, searchQuery])

  const getClientWithWeeksById = (clientId: string): ClientData | null => {
    const found = clientsWithCalculatedWeeks.find(c => c.id === clientId)
    return found || null
  }

  // Skaičiuoti sumas kiekvienai savaitei
  const weekSums = useMemo(() => {
    const sums: { [weekId: string]: number } = {}
    weeks.forEach(week => {
      sums[week.id] = clientsWithCalculatedWeeks.reduce((sum, client) => sum + (client.weeks[week.id] || 0), 0)
    })
    return sums
  }, [clientsWithCalculatedWeeks, weeks])

  const openModal = (client: ClientData) => {
    // debug
    try { console.log('openModal called with', client?.name) } catch {}
    setSelectedTask(client)
    setIsModalOpen(true)
  }

  const openFromReminder = (clientId: string) => {
    const client = getClientWithWeeksById(clientId)
    if (client) {
      openModal(client)
    }
  }

  const dismissReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  // Temp: press 'm' to open first visible client (diagnostics)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        if (filteredClients[0]) openModal(filteredClients[0])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [filteredClients])

  const handleFormChange = (field: keyof NewClientForm, value: string) => {
    setNewClientForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAddClient = () => {
    if (!newClientForm.name || !newClientForm.orderNumber || !newClientForm.startDate || !newClientForm.endDate) {
      alert('Prašome užpildyti visus privalomus laukus')
      return
    }

    // Patikrinti, ar pabaigos data yra po pradžios datos
    if (new Date(newClientForm.endDate) <= new Date(newClientForm.startDate)) {
      alert('Pabaigos data turi būti po pradžios datos')
      return
    }

    // Patikrinti, ar jau egzistuoja klientas su tuo pačiu pavadinimu ir užsakymo numeriu
    const existingClient = clients.find(client => 
      client.name.toLowerCase() === newClientForm.name.toLowerCase() && 
      client.orderNumber.toLowerCase() === newClientForm.orderNumber.toLowerCase()
    )
    
    if (existingClient) {
      alert('Klientas su tokiu pavadinimu ir užsakymo numeriu jau egzistuoja!')
      return
    }

    const newClient: ClientData = {
      id: Date.now().toString(),
      name: newClientForm.name,
      status: newClientForm.status,
      orderNumber: newClientForm.orderNumber,
      startDate: newClientForm.startDate,
      endDate: newClientForm.endDate,
      intensity: newClientForm.intensity,
      weeks: generateWeekValues(newClientForm.startDate, newClientForm.endDate, newClientForm.intensity, weeks),
      hasWarning: false,
      comment: ''
    }

    setClients(prev => {
      const next = [...prev, newClient]
      try { localStorage.setItem('viadukai.clients', JSON.stringify(next)) } catch {}
      return next
    })
    
    // Išvalyti formą
    setNewClientForm({
      name: '',
      status: 'Patvirtinta',
      orderNumber: '',
      startDate: '',
      endDate: '',
      intensity: 'kas 1 (100%)'
    })

    // Pašaliname patvirtinimo alert'ą - vartotojas jau apsisprendė
  }

  // Gauti šiandienos datą formatu YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Warning: status Rezervuota AND start date within next 14 days
  const isWarningClient = (client: ClientData) => {
    if (client.status !== 'Rezervuota' || !client.startDate) return false
    const today = new Date()
    const start = new Date(client.startDate)
    // normalize to start-of-day
    today.setHours(0,0,0,0)
    start.setHours(0,0,0,0)
    const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 14
  }

  // Identify current week's column
  const isCurrentWeek = (week: WeekData) => {
    const today = new Date()
    const start = new Date(week.startDate)
    const end = new Date(week.endDate)
    start.setHours(0,0,0,0)
    end.setHours(23,59,59,999)
    return today >= start && today <= end
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200 bg-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Q Search"
                value={searchQuery}
                onChange={(e)=>setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50" onClick={() => { if (filteredClients[0]) openModal(filteredClients[0]) }}>Test modal</button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700">
            As Filtruoti
            <span className="text-xs">▼</span>
          </button>
        </div>
      </div>

      {/* Add Client Section */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Pridėti klientą</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pavadinimas *</label>
            <input
              type="text"
              placeholder="Įveskite kliento pavadinimą"
              value={newClientForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statusas</label>
            <select 
              value={newClientForm.status}
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
              value={newClientForm.orderNumber}
              onChange={(e) => handleFormChange('orderNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data nuo *</label>
            <input
              type="date"
              lang="en-CA"
              value={newClientForm.startDate}
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
              value={newClientForm.endDate}
              onChange={(e) => handleFormChange('endDate', e.target.value)}
              min={newClientForm.startDate || getTodayString()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intensyvumas</label>
            <select 
              value={newClientForm.intensity}
              onChange={(e) => handleFormChange('intensity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            >
              <option value="kas 1 (100%)">Kas 1</option>
              <option value="kas 2 (50%)">Kas 2</option>
              <option value="kas 4 (25%)">Kas 4</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleAddClient}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
            >
              + Pridėti
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto relative z-10">
        <table className="w-full relative z-10">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[220px] border-r border-gray-200 sticky left-0 z-20 bg-white">Pavadinimas</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[100px] border-r border-gray-200 sticky left-[220px] z-20 bg-white shadow-r">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[120px] border-r border-gray-200">Užsakymo Nr.</th>
              {/* Dinamiškai generuojami savaitės stulpeliai */}
              {weeks.map((week, index) => (
                <th 
                  key={week.id} 
                  className={`px-3 py-3 text-center text-sm font-medium text-gray-900 min-w-[100px] border-r border-gray-200 ${
                    index === weeks.length - 1 ? '' : 'border-r'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{week.shortLabel}</div>
                  <div className="text-xs text-gray-500 font-normal mt-1">
                    {week.startDate.toLocaleDateString('lt-LT', { day: '2-digit', month: '2-digit' })} - {week.endDate.toLocaleDateString('lt-LT', { day: '2-digit', month: '2-digit' })}
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-center text-sm font-medium text-gray-900 min-w-[90px]">Veiksmai</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-100 transition-opacity ${hydrated ? 'opacity-100' : 'opacity-0'}` }>
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-transparent cursor-pointer transition-colors" onDoubleClick={() => openModal(client)}>
                <td className="px-4 py-3 border-r border-gray-200 sticky left-0 z-10 bg-white" onClick={() => openModal(client)}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onClick={(e)=>e.stopPropagation()} />
                    <div className="flex items-center gap-2 cursor-pointer select-none">
                      {isWarningClient(client) && (
                        <span className="text-xs text-orange-600" aria-label="alert">⚠️</span>
                      )}
                      <span className="text-sm font-medium text-gray-900">{client.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200 sticky left-[220px] z-10 bg-white shadow-r" onClick={() => openModal(client)}>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                    client.status === 'Patvirtinta' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : client.status === 'Rezervuota'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200" onClick={() => openModal(client)}>{client.orderNumber}</td>
                {weeks.map((week, index) => (
                  <td key={week.id} className={`px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200 ${
                    index === weeks.length - 1 ? '' : 'border-r'
                  }`} onClick={() => openModal(client)}>
                    <span className={`font-medium ${
                      client.weeks[week.id] && client.weeks[week.id] > 0 
                        ? client.weeks[week.id] > 240 
                          ? 'text-white bg-red-500 px-2 py-1 rounded font-bold' 
                          : 'text-blue-600' 
                        : 'text-gray-400'
                    }`}>
                      {client.weeks[week.id] || 0}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-3 text-center">
                  <button onClick={(e)=>{ e.stopPropagation(); openModal(client); }} className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Redaguoti</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Suma Row - inside the scroll container to sync horizontally */}
        <div className={`bg-gray-100 border-t border-gray-200 sticky bottom-0 transition-opacity ${hydrated ? 'opacity-100' : 'opacity-0'}` }>
          <div className="flex items-center px-4 py-3 relative">
            <span className="text-sm font-semibold text-gray-900 min-w-[220px] border-r border-gray-200 pr-4">Transliacijų viso:</span>
            <span className="text-sm font-semibold text-gray-900 min-w-[100px] border-r border-gray-200 pr-4"></span>
            <span className="text-sm font-semibold text-gray-900 min-w-[120px] border-r border-gray-200 pr-4"></span>
            {weeks.map((week, index) => (
              <span key={week.id} className={`text-sm font-semibold text-gray-900 min-w-[100px] text-center border-r border-gray-200 pr-4 ${
                index === weeks.length - 1 ? '' : 'border-r'
              }`}>
                <span className={`${
                  weekSums[week.id] > 240 
                    ? 'text-white bg-red-500 px-2 py-1 rounded font-bold' 
                    : ''
                }`}>
                  {weekSums[week.id]}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <TaskDetailModal
        open={isModalOpen}
        onOpenChange={(v) => setIsModalOpen(v)}
        task={selectedTask}
        onSaveReminder={(remindAt: string, message: string) => {
          if (!selectedTask) return
          saveReminder(selectedTask.id, remindAt, message)
        }}
        currentReminder={selectedTask ? getReminder(selectedTask.id) : undefined}
        onSaveDetails={(payload) => saveClientDetails(payload)}
        onDelete={(clientId: string) => deleteClient(clientId)}
      />
    </div>
  )
}