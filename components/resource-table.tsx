'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { isSupabaseEnabled, fetchClients as sbFetchClients, upsertClient as sbUpsertClient, deleteClientById as sbDeleteClient, fetchReminders as sbFetchReminders, upsertReminder as sbUpsertReminder, deleteRemindersByClient as sbDeleteReminders, updateReminderStatus } from '../lib/supabase'
import TaskDetailModal from './task-detail-modal'
import WaitingListModal from './waiting-list-modal'
import RemindersPopup from './reminders-popup'
import ReservedClientsWarningModal from './reserved-clients-warning-modal'
import AddClientModal, { type NewClientForm } from './add-client-modal'
import { generateExtendedWeeks, getCurrentWeekStart, WeekData, generateWeekValues, isYearBoundary } from '../lib/utils'

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

interface Reminder {
  id: string
  clientId: string
  message: string
  remindAt: string
  status?: string
  shownToday?: boolean
  lastShown?: string
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
  },
  {
    id: '6',
    name: 'TEST - Raudonas fonas',
    status: 'Patvirtinta',
    orderNumber: 'ORD-006',
    startDate: '2025-08-18',
    endDate: '2025-08-24',
    intensity: 'kas 1 (100%)',
    weeks: {
      'W-34': 280,
      'W-35': 260,
      'W-36': 220,
      'W-37': 300,
    },
    comment: 'Testas raudonam fonui'
  }
]

export default function ResourceTable() {
  // State management
  const [clients, setClients] = useState<ClientData[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ClientData | null>(null)
  const [isWaitingListOpen, setIsWaitingListOpen] = useState(false)
  const [showRemindersPopup, setShowRemindersPopup] = useState(false)
  const [showReservedWarningModal, setShowReservedWarningModal] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'>('All')
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')
  const [showInactiveClients, setShowInactiveClients] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<'name' | 'orderNumber' | 'startDate' | 'endDate' | 'status' | 'warning' | 'date'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Pagination state
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)

  // Timer for warnings
  const [nowTick, setNowTick] = useState<number>(Date.now())

  // Generate weeks
  const weeks = useMemo(() => {
    return generateExtendedWeeks()
  }, [])

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isSupabaseEnabled) {
          console.log('Loading data from Supabase...')
          const [c, r] = await Promise.all([sbFetchClients(), sbFetchReminders()])
          console.log('Fetched clients:', c)
          console.log('Fetched reminders:', r)
          
          if (Array.isArray(c) && c.length > 0) {
            setClients(c as any)
          } else {
            console.log('No clients from Supabase, using DEFAULT_CLIENTS')
            setClients(DEFAULT_CLIENTS)
          }
          
          if (Array.isArray(r) && r.length > 0) {
            setReminders(r as any)
          } else {
            setReminders([])
          }
        } else {
          console.log('Supabase not enabled, loading from localStorage...')
          const storedClients = localStorage.getItem('viadukai.clients')
          const storedReminders = localStorage.getItem('viadukai.reminders')
          
          if (storedClients) {
            const parsed = JSON.parse(storedClients)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setClients(parsed)
            } else {
              setClients(DEFAULT_CLIENTS)
            }
          } else {
            setClients(DEFAULT_CLIENTS)
          }
          
          if (storedReminders) {
            const parsed = JSON.parse(storedReminders)
            if (Array.isArray(parsed)) setReminders(parsed)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setClients(DEFAULT_CLIENTS)
        setReminders([])
      }
      setHydrated(true)
    }

    loadData()
  }, [isSupabaseEnabled])

  // Automatiškai sukurti priminimus užkrovus duomenis
  useEffect(() => {
    if (!hydrated || clients.length === 0) return
    
    // Patikrinti visus "Rezervuota" klientus ir sukurti priminimus, jei reikia
    setReminders(prev => {
      const newReminders: Reminder[] = []
      
      clients.forEach(client => {
        if (client.status === 'Rezervuota' && client.startDate) {
          const reminderDate = getReminderDate21Days(client.startDate)
          if (reminderDate) {
            // Patikrinti, ar priminimas jau egzistuoja
            const existingReminder = prev.find(r => 
              r.clientId === client.id && r.message.includes('21 diena')
            )
            
            if (!existingReminder) {
              newReminders.push({
                id: `r-${client.id}-21d-${Date.now()}`,
                clientId: client.id,
                remindAt: reminderDate,
                message: `Kampanija "${client.name}" yra rezervuota. Iki kampanijos starto liko 21 diena.`,
                status: 'active',
                shownToday: false
              })
            } else if (existingReminder.remindAt !== reminderDate) {
              // Atnaujinti esamą priminimą, jei data pasikeitė
              const updated = prev.map(r => 
                r.id === existingReminder.id
                  ? { ...r, remindAt: reminderDate, status: 'active', shownToday: false }
                  : r
              )
              return updated
            }
          }
        }
      })
      
      if (newReminders.length > 0) {
        return [...prev, ...newReminders]
      }
      return prev
    })
  }, [hydrated, clients])

  // Save reminders to storage (debounced)
  const saveRemindersTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (!hydrated) return
    
    // Debounce saugojimą, kad nebandytų saugoti kiekvieną kartą
    if (saveRemindersTimeoutRef.current) {
      clearTimeout(saveRemindersTimeoutRef.current)
    }
    
    saveRemindersTimeoutRef.current = setTimeout(() => {
      if (isSupabaseEnabled) {
        reminders.forEach(r => {
          sbUpsertReminder(r as any).catch((err) => {
            // Tik log'uoti tikras klaidas, ne 400/404 klaidas, kurios gali būti dėl duomenų struktūros
            if (err?.code !== 'PGRST116' && err?.status !== 404) {
              console.error('❌ Priminimas: klaida saugant į Supabase:', err)
            }
          })
        })
      } else {
        try { 
          localStorage.setItem('viadukai.reminders', JSON.stringify(reminders))
        } catch (err) {
          console.error('❌ Priminimas: klaida saugant į localStorage:', err)
        }
      }
    }, 1000) // Saugoti po 1 sekundės
    
    return () => {
      if (saveRemindersTimeoutRef.current) {
        clearTimeout(saveRemindersTimeoutRef.current)
      }
    }
  }, [reminders, hydrated, isSupabaseEnabled])

  // Timer for warnings
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 60000)
    return () => clearInterval(t)
  }, [])

  // Check for today's reminders when page loads
  useEffect(() => {
    if (!hydrated || !reminders.length) return
    
    const today = getTodayString()
    const todaysReminders = reminders.filter(r => 
      r.remindAt === today && 
      (!r.status || r.status === 'active') && 
      (!r.shownToday || !r.shownToday)
    )
    
    if (todaysReminders.length > 0) {
      setShowRemindersPopup(true)
    }
  }, [hydrated, reminders])

  // Automatiškai patikrinti "Rezervuota" klientus ir rodyti perspėjimo modalą
  useEffect(() => {
    if (!hydrated || clients.length === 0) return
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Patikrinti, ar yra "Rezervuota" klientų, kuriems iki starto liko ≤21 diena
    const warningClients = clients.filter(client => {
      if (client.status !== 'Rezervuota' || !client.startDate) return false
      
      const start = new Date(client.startDate)
      start.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return diffDays >= 0 && diffDays <= 21
    })
    
    // Rodyti modalą, jei yra perspėjamų klientų
    if (warningClients.length > 0) {
      // Palaukti šiek tiek, kad puslapis užsikrautų
      const timer = setTimeout(() => {
        setShowReservedWarningModal(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [hydrated, clients])

  // Helper functions
  const getTodayString = () => new Date().toISOString().split('T')[0]

  const isWarningClient = (client: ClientData) => {
    if (client.status !== 'Rezervuota' || !client.startDate) return false
    const today = new Date()
    const start = new Date(client.startDate)
    today.setHours(0,0,0,0)
    start.setHours(0,0,0,0)
    const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 14
  }

  // Apskaičiuoja 21 dienų priminimo datą (21 diena iki kampanijos starto)
  const getReminderDate21Days = (startDate: string): string | null => {
    if (!startDate) return null
    const start = new Date(startDate)
    const today = new Date()
    today.setHours(0,0,0,0)
    start.setHours(0,0,0,0)
    
    // Apskaičiuoti dienų skaičių iki starto
    const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    // Jei iki starto liko 21 diena arba mažiau (bet ne mažiau nei 0), sukurti priminimą šiandien
    if (diffDays >= 0 && diffDays <= 21) {
      return today.toISOString().split('T')[0]
    }
    
    // Jei iki starto liko daugiau nei 21 diena, sukurti priminimą 21 dieną iki starto
    if (diffDays > 21) {
      const reminderDate = new Date(start)
      reminderDate.setDate(start.getDate() - 21)
      reminderDate.setHours(0,0,0,0)
      return reminderDate.toISOString().split('T')[0]
    }
    
    // Jei kampanija jau prasidėjo, nebekurti priminimo
    return null
  }

  // Automatiškai sukuria priminimą, jei klientas yra "Rezervuota" ir iki starto liko 21 diena
  const autoCreateReminder21Days = (client: ClientData) => {
    if (client.status !== 'Rezervuota' || !client.startDate) return
    
    const reminderDate = getReminderDate21Days(client.startDate)
    if (!reminderDate) return
    
    // Naudoti callback, kad gautume naujausią reminders state
    setReminders(prev => {
      // Patikrinti, ar priminimas jau egzistuoja
      const existingReminder = prev.find(r => r.clientId === client.id && r.message.includes('21 diena'))
      
      // Jei priminimas jau egzistuoja ir yra 21 dienų priminimas, patikrinti ar reikia jį atnaujinti
      if (existingReminder) {
        const shouldUpdate = existingReminder.remindAt !== reminderDate || 
                            existingReminder.message !== `Kampanija "${client.name}" yra rezervuota. Iki kampanijos starto liko 21 diena.`
        
        if (shouldUpdate) {
          return prev.map(r => 
            r.id === existingReminder.id
              ? { ...r, remindAt: reminderDate, message: `Kampanija "${client.name}" yra rezervuota. Iki kampanijos starto liko 21 diena.`, status: 'active', shownToday: false }
              : r
          )
        }
        return prev
      }
      
      // Sukurti naują priminimą
      return [...prev, { 
        id: `r-${client.id}-21d-${Date.now()}`, 
        clientId: client.id, 
        remindAt: reminderDate, 
        message: `Kampanija "${client.name}" yra rezervuota. Iki kampanijos starto liko 21 diena.`, 
        status: 'active', 
        shownToday: false 
      }]
    })
  }

  const isCurrentWeek = (week: WeekData) => {
    const today = new Date()
    const start = new Date(week.startDate)
    const end = new Date(week.endDate)
    start.setHours(0,0,0,0)
    end.setHours(23,59,59,999)
    return today >= start && today <= end
  }

  // Client management functions
  const saveClientDetails = (update: {
    id: string
    name?: string
    status?: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'
    orderNumber?: string
    intensity?: string
    startDate?: string
    endDate?: string
    comment?: string
    files?: { name: string; size: number }[]
  }) => {
    console.log('🔧 saveClientDetails called with:', update)
    
    setClients(prev => {
      const next = prev.map(c => {
        if (c.id === update.id) {
          const updatedClient = {
            ...c,
            name: update.name ?? c.name,
            status: update.status ?? c.status,
            orderNumber: update.orderNumber ?? c.orderNumber,
            intensity: update.intensity ?? c.intensity,
            startDate: update.startDate ?? c.startDate,
            endDate: update.endDate ?? c.endDate,
            comment: update.comment ?? c.comment,
            files: update.files ?? c.files,
            hasWarning: isWarningClient({
              ...c,
              status: update.status ?? c.status,
              startDate: update.startDate ?? c.startDate
            })
          }
          
          // Save to storage
          if (isSupabaseEnabled) {
            sbUpsertClient(updatedClient as any).catch(() => {})
          }
          
          return updatedClient
        }
        return c
      })
      
      // Save to localStorage if not using Supabase
      if (!isSupabaseEnabled) {
        try { localStorage.setItem('viadukai.clients', JSON.stringify(next)) } catch {}
      }
      
      console.log('🔧 Updated clients state:', next)
      
      // Automatiškai sukurti arba atnaujinti priminimą, jei reikia
      const updatedClient = next.find(c => c.id === update.id)
      if (updatedClient) {
        // Jei klientas nebe "Rezervuota", pašalinti automatinį priminimą
        if (updatedClient.status !== 'Rezervuota') {
          const existingReminder = reminders.find(r => r.clientId === updatedClient.id)
          if (existingReminder && existingReminder.message.includes('21 diena')) {
            setReminders(prev => prev.filter(r => r.id !== existingReminder.id))
          }
        } else {
          // Jei klientas yra "Rezervuota", sukurti arba atnaujinti priminimą
          autoCreateReminder21Days(updatedClient)
        }
      }
      
      return next
    })
  }

  const deleteClient = async (clientId: string) => {
    if (isSupabaseEnabled) {
      try {
        await sbDeleteClient(clientId)
        await sbDeleteReminders(clientId)
      } catch (error) {
        console.error('Failed to delete from Supabase:', error)
      }
    }
    
    setClients(prev => {
      const next = prev.filter(c => c.id !== clientId)
      if (!isSupabaseEnabled) { 
        try { localStorage.setItem('viadukai.clients', JSON.stringify(next)) } catch {} 
      }
      return next
    })
    
    setReminders(prev => {
      const next = prev.filter(r => r.clientId !== clientId)
      if (!isSupabaseEnabled) { 
        try { localStorage.setItem('viadukai.reminders', JSON.stringify(next)) } catch {} 
      }
      return next
    })
    
    setIsModalOpen(false)
  }

  const saveReminder = (clientId: string, remindAt: string, message: string) => {
    setReminders(prev => {
      if (!remindAt) {
        return prev.filter(r => r.clientId !== clientId)
      }
      
      const existing = prev.find(r => r.clientId === clientId)
      if (existing) {
        return prev.map(r => r.clientId === clientId ? { ...r, remindAt, message, status: 'active', shownToday: false } : r)
      }
      
      return [...prev, { id: `r-${clientId}-${Date.now()}`, clientId, remindAt, message, status: 'active', shownToday: false }]
    })
  }

  const handleReminderCompleted = async (reminderId: string) => {
    if (isSupabaseEnabled) {
      await updateReminderStatus(reminderId, 'completed', true)
    }
    
    setReminders(prev => prev.map(r => 
      r.id === reminderId 
        ? { ...r, status: 'completed', shownToday: true, lastShown: getTodayString() }
        : r
    ))
  }

  const handleRemindersPopupClose = () => {
    // Mark all today's reminders as shown
    const today = getTodayString()
    const todaysReminders = reminders.filter(r => 
      r.remindAt === today && 
      (!r.status || r.status === 'active')
    )
    
    todaysReminders.forEach(reminder => {
      if (isSupabaseEnabled) {
        updateReminderStatus(reminder.id, reminder.status || 'active', true)
      }
      
      setReminders(prev => prev.map(r => 
        r.id === reminder.id 
          ? { ...r, shownToday: true, lastShown: today }
          : r
      ))
    })
    
    setShowRemindersPopup(false)
  }

  const getReminder = (clientId: string) => reminders.find(r => r.clientId === clientId)

  const handleAddClient = (form: NewClientForm): boolean => {
    const existingClient = clients.find(client => 
      client.name.toLowerCase() === form.name.toLowerCase() && 
      client.orderNumber.toLowerCase() === form.orderNumber.toLowerCase()
    )
    
    if (existingClient) {
      alert('Klientas su tokiu pavadinimu ir užsakymo numeriu jau egzistuoja!')
      return false
    }

    const newClient: ClientData = {
      id: Date.now().toString(),
      name: form.name,
      status: form.status,
      orderNumber: form.orderNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      intensity: form.intensity,
      weeks: generateWeekValues(form.startDate, form.endDate, form.intensity, weeks),
      hasWarning: false,
      comment: ''
    }

    setClients(prev => {
      const next = [...prev, newClient]
      
      if (isSupabaseEnabled) {
        sbUpsertClient(newClient as any).catch(() => {})
      } else {
        try { localStorage.setItem('viadukai.clients', JSON.stringify(next)) } catch {}
      }
      
      return next
    })
    
    autoCreateReminder21Days(newClient)
    return true
  }

  // Modal handling
  const openModal = (client: ClientData) => {
    setSelectedTask(client)
    setIsModalOpen(true)
  }

  const openFromReminder = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      openModal(client)
    }
  }

  const dismissReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  // Computed values
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [nowTick])
  const dueReminders = useMemo(() => reminders.filter(r => r.remindAt && r.remindAt <= todayStr), [reminders, todayStr])

  const clientsWithCalculatedWeeks = useMemo(() => {
    return clients.map(client => ({
      ...client,
      weeks: generateWeekValues(client.startDate, client.endDate, client.intensity, weeks)
    }))
  }, [clients, weeks])

  // Klientai, įskaitant tik tuos, kurių kampanija per pastaruosius 2 mėn. (kai showInactiveClients = false)
  const twoMonthsAgoStr = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 2)
    return d.toISOString().split('T')[0]
  }, [nowTick])
  const clientsForSums = useMemo(() => {
    if (showInactiveClients) return clientsWithCalculatedWeeks
    return clientsWithCalculatedWeeks.filter(c => !c.endDate || c.endDate >= twoMonthsAgoStr)
  }, [clientsWithCalculatedWeeks, showInactiveClients, twoMonthsAgoStr])

  const filteredAndSortedClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    // clientsForSums jau filtruoja pagal aktyvų periodą – naudojame tą patį sąrašą
    let arr = clientsForSums.filter(c => {
      const matchesQ = !q || c.name.toLowerCase().includes(q) || c.orderNumber.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter
      const matchesFrom = !dateFromFilter || (c.startDate && c.startDate >= dateFromFilter)
      const matchesTo = !dateToFilter || (c.endDate && c.endDate <= dateToFilter)
      return matchesQ && matchesStatus && matchesFrom && matchesTo
    })
    
    const compare = (a: any, b: any) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const todayStr = new Date().toISOString().split('T')[0]

      // Rūšiavimas pagal datą: dabar einantys viršuje, tada artimiausios ateityje, likę apačioje
      if (sortBy === 'date') {
        const isOngoing = (c: any) => c.startDate && c.endDate && c.startDate <= todayStr && c.endDate >= todayStr
        const isFuture = (c: any) => c.startDate && c.startDate > todayStr
        const aOngoing = isOngoing(a)
        const bOngoing = isOngoing(b)
        const aFuture = isFuture(a)
        const bFuture = isFuture(b)
        // 1) Dabar einantys viršuje
        if (aOngoing && !bOngoing) return -1
        if (!aOngoing && bOngoing) return 1
        if (aOngoing && bOngoing) return (a.endDate || '').localeCompare(b.endDate || '')
        // 2) Ateities kampanijos – artimiausios pirmiau
        if (aFuture && !bFuture) return -1
        if (!aFuture && bFuture) return 1
        if (aFuture && bFuture) return (a.startDate || '').localeCompare(b.startDate || '')
        // 3) Praeities – naujausios (didžiausia endDate) viršuje
        return (b.endDate || '').localeCompare(a.endDate || '')
      }

      // Specialus rūšiavimas pagal perspėjimą
      if (sortBy === 'warning') {
        const aHasWarning = isWarningClient(a)
        const bHasWarning = isWarningClient(b)
        
        // Pirmiausia tie, kurie turi perspėjimą
        if (aHasWarning && !bHasWarning) return -dir
        if (!aHasWarning && bHasWarning) return dir
        
        // Jei abu turi arba abu neturi perspėjimą, rūšiuojame pagal dienų skaičių iki starto
        if (aHasWarning && bHasWarning) {
          const aDays = a.startDate ? Math.floor((new Date(a.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : Infinity
          const bDays = b.startDate ? Math.floor((new Date(b.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : Infinity
          if (aDays !== bDays) return aDays > bDays ? dir : -dir
        }
        
        // Jei abu neturi perspėjimų, rūšiuojame pagal statusą (Rezervuota pirmiau)
        if (!aHasWarning && !bHasWarning) {
          if (a.status === 'Rezervuota' && b.status !== 'Rezervuota') return -dir
          if (a.status !== 'Rezervuota' && b.status === 'Rezervuota') return dir
        }
        
        // Jei vis dar lygu, rūšiuojame pagal pavadinimą
        return a.name.toLowerCase() > b.name.toLowerCase() ? dir : -dir
      }
      
      let av: any = a[sortBy]
      let bv: any = b[sortBy]
      if (sortBy === 'name' || sortBy === 'orderNumber' || sortBy === 'status') {
        av = (av || '').toString().toLowerCase()
        bv = (bv || '').toString().toLowerCase()
      }
      if (av === bv) return 0
      return av > bv ? dir : -dir
    }
    
    arr.sort(compare)
    return arr
  }, [clientsForSums, searchQuery, statusFilter, dateFromFilter, dateToFilter, sortBy, sortDir])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAndSortedClients.length / pageSize)), [filteredAndSortedClients.length, pageSize])
  const paginatedClients = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSortedClients.slice(start, start + pageSize)
  }, [filteredAndSortedClients, page, pageSize])

  const weekSums = useMemo(() => {
    const sums: { [weekId: string]: number } = {}
    weeks.forEach(week => {
      sums[week.id] = clientsForSums
        .filter(client => client.status !== 'Atšaukta')
        .reduce((sum, client) => sum + (client.weeks[week.id] || 0), 0)
    })
    return sums
  }, [clientsForSums, weeks])

  // Klientų sąrašas per savaitę (tooltip'ui)
  const weekClients = useMemo(() => {
    const clients: { [weekId: string]: { name: string; value: number; status: string }[] } = {}
    weeks.forEach(week => {
      clients[week.id] = clientsForSums
        .filter(client => client.status !== 'Atšaukta' && client.weeks[week.id] > 0)
        .map(client => ({
          name: client.name,
          value: client.weeks[week.id],
          status: client.status
        }))
        .sort((a, b) => b.value - a.value) // Rūšiuoti pagal reikšmę (didžiausia viršuje)
    })
    return clients
  }, [clientsForSums, weeks])

  // Reset page when filters change
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages, page])

  // Debug: klausytis selectedTask pakeitimų
  useEffect(() => {
    console.log('🔧 selectedTask changed to:', selectedTask)
  }, [selectedTask])

  // Keyboard shortcuts for debugging (disabled when modal is open)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Neveikia kai modal'as atidarytas
      if (isModalOpen) return
      
      if (e.key.toLowerCase() === 'm') {
        if (filteredAndSortedClients[0]) openModal(filteredAndSortedClients[0])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [filteredAndSortedClients, isModalOpen])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kraunama...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header su logotipu */}
      <header className="flex justify-center items-center py-9 border-b border-gray-200 bg-white">
        <img src="/Piksel-logo.jpg" alt="Logo" className="h-[39px] object-contain" />
      </header>

      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200 bg-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Q Search"
                value={searchQuery}
                onChange={(e)=>{ setSearchQuery(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value as any); setPage(1) }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="All">Visi statusai</option>
              <option value="Patvirtinta">Patvirtinta</option>
              <option value="Rezervuota">Rezervuota</option>
              <option value="Atšaukta">Atšaukta</option>
            </select>
            <input type="date" lang="en-CA" value={dateFromFilter} onChange={(e)=>{ setDateFromFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
            <input type="date" lang="en-CA" value={dateToFilter} onChange={(e)=>{ setDateToFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
            <select value={sortBy} onChange={(e)=>setSortBy(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="date">Rūšiuoti: Data (einantys viršuje)</option>
              <option value="name">Rūšiuoti: Pavadinimas</option>
              <option value="orderNumber">Rūšiuoti: Užsakymo Nr.</option>
              <option value="startDate">Rūšiuoti: Data nuo</option>
              <option value="endDate">Rūšiuoti: Data iki</option>
              <option value="status">Rūšiuoti: Statusas</option>
              <option value="warning">Rūšiuoti: Perspėjimas (≤14 d.)</option>
            </select>
            <select value={sortDir} onChange={(e)=>setSortDir(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="asc">↑</option>
              <option value="desc">↓</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={showInactiveClients}
                onChange={(e)=>{ setShowInactiveClients(e.target.checked); setPage(1) }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Rodyti neaktyvius</span>
            </label>
          </div>
        </div>
      </div>

      {/* Add Client + Waiting List */}
      <div className="p-4 border-b border-gray-200 flex gap-2">
        <button 
          onClick={() => setIsAddClientModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
        >
          + Pridėti klientą
        </button>
        <button 
          onClick={() => setIsWaitingListOpen(true)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium whitespace-nowrap transition-colors"
          title="Waiting List - klientai, kurie laukia vietos"
        >
          Laukia
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto relative z-10">
        <table className="w-full relative z-10">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-30">
            <tr>
              <th className="px-2 py-3 text-center text-sm font-medium text-gray-900 min-w-[48px] border-r border-gray-200 sticky left-0 z-40 bg-gray-50">Nr</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[220px] border-r border-gray-200 sticky left-[48px] z-40 bg-gray-50">Pavadinimas</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[100px] border-r border-gray-200 sticky left-[268px] z-40 bg-gray-50 shadow-r">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[120px] border-r border-gray-200">Užsakymo Nr.</th>
              {weeks.map((week, index) => {
                const fillPercent = Math.min(100, Math.round(((weekSums[week.id] || 0) / 240) * 100))
                return (
                <th 
                  key={week.id} 
                  className={`px-3 py-3 text-center text-sm font-medium text-gray-900 min-w-[100px] border-r border-gray-200 sticky top-0 z-30 relative overflow-hidden bg-gray-50 ${
                    index === weeks.length - 1 ? '' : 'border-r'
                  } ${week.isYearBoundary ? 'border-l-2 border-l-green-500' : ''}`}
                >
                  {fillPercent > 0 && (
                    <div
                      className="absolute left-0 top-0 h-[5px]"
                      style={{
                        width: `${fillPercent}%`,
                        backgroundColor: fillPercent >= 100 ? 'rgba(55,65,81,0.8)' : fillPercent >= 75 ? 'rgba(55,65,81,0.5)' : 'rgba(55,65,81,0.3)',
                      }}
                    />
                  )}
                  <div className={`relative z-10 font-semibold ${isCurrentWeek(week) ? 'text-green-600' : 'text-gray-800'}`}>
                    {week.shortLabel}
                    {week.isYearBoundary && <span className="text-green-600 text-xs ml-1">→{week.year}</span>}
                  </div>
                  <div className="relative z-10 text-xs text-gray-500 font-normal mt-1">
                    {week.startDate.toLocaleDateString('lt-LT', { day: '2-digit', month: '2-digit' })} - {week.endDate.toLocaleDateString('lt-LT', { day: '2-digit', month: '2-digit' })}
                  </div>
                  {fillPercent > 0 && (
                    <div className="relative z-10 text-[10px] font-medium mt-0.5" style={{ color: fillPercent >= 75 ? 'rgb(75,85,99)' : 'rgb(156,163,175)' }}>
                      {fillPercent}%
                    </div>
                  )}
                </th>
                )
              })}
              <th className="px-3 py-3 text-center text-sm font-medium text-gray-900 min-w-[90px]">Veiksmai</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-100 transition-opacity ${hydrated ? 'opacity-100' : 'opacity-0'}` } style={{ paddingTop: '144px' }}>
            {paginatedClients.map((client, index) => (
              <tr key={client.id} className="hover:bg-transparent cursor-pointer transition-colors" onDoubleClick={() => openModal(client)}>
                <td className="px-2 py-3 text-center text-sm text-gray-500 border-r border-gray-200 sticky left-0 z-5 bg-white" onClick={() => openModal(client)}>
                  {(page - 1) * pageSize + index + 1}
                </td>
                <td className="px-4 py-3 border-r border-gray-200 sticky left-[48px] z-5 bg-white" onClick={() => openModal(client)}>
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
                <td className="px-4 py-3 border-r border-gray-200 sticky left-[268px] z-5 bg-white shadow-r" onClick={() => openModal(client)}>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                    client.status === 'Patvirtinta' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200" onClick={() => openModal(client)}>{client.orderNumber}</td>
                {weeks.map((week, index) => (
                  <td key={week.id} className={`px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200 ${
                    index === weeks.length - 1 ? '' : 'border-r'
                  } ${week.isYearBoundary ? 'border-l-2 border-l-green-500' : ''}`} onClick={() => openModal(client)}>
                    <span className={`font-medium ${
                      client.weeks[week.id] && client.weeks[week.id] > 0 
                        ? client.weeks[week.id] > 240 
                          ? 'text-white bg-red-500 px-2 py-1 rounded font-bold' 
                          : client.weeks[week.id] === 40 
                            ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded' 
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
        
        {/* Suma Row */}
        <div className="bg-gray-100 border-t border-gray-200 sticky top-[72px] z-20" style={{ position: 'sticky', top: '72px' }}>
          <div className="flex items-center px-4 py-3 relative">
            <span className="text-sm font-semibold text-gray-900 min-w-[48px] border-r border-gray-200 pr-2 text-center sticky left-0 z-30 bg-gray-100" style={{ position: 'sticky', left: '0' }}></span>
            <span className="text-sm font-semibold text-gray-900 min-w-[220px] border-r border-gray-200 pr-4 sticky left-[48px] z-30 bg-gray-100" style={{ position: 'sticky', left: '48px' }}>Transliacijų viso:</span>
            <span className="text-sm font-semibold text-gray-900 min-w-[100px] border-r border-gray-200 pr-4 sticky left-[268px] z-30 bg-gray-100 shadow-r" style={{ position: 'sticky', left: '268px' }}></span>
            <span className="text-sm font-semibold text-gray-900 min-w-[120px] border-r border-gray-200 pr-4"></span>
            {weeks.map((week, index) => (
              <span key={week.id} className={`relative text-sm font-semibold text-gray-900 min-w-[100px] text-center border-r border-gray-200 pr-4 group cursor-pointer ${
                index === weeks.length - 1 ? '' : 'border-r'
              } ${week.isYearBoundary ? 'border-l-2 border-l-green-500' : ''}`}>
                <span className={`${
                  weekSums[week.id] >= 240 
                    ? 'text-white bg-red-500 px-2 py-1 rounded font-bold' 
                    : weekSums[week.id] === 40 
                      ? 'bg-blue-50 px-2 py-1 rounded' 
                      : ''
                }`}>
                  {weekSums[week.id]}
                </span>
                {/* Tooltip su klientų sąrašu */}
                {weekClients[week.id]?.length > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]">
                      <div className="font-semibold mb-2 text-gray-300 border-b border-gray-700 pb-1">
                        {week.shortLabel} • {weekClients[week.id].length} klient{weekClients[week.id].length === 1 ? 'as' : 'ai'}
                      </div>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {weekClients[week.id].map((client, idx) => (
                          <div key={idx} className="flex justify-between items-center gap-2">
                            <span className="truncate flex-1">{client.name}</span>
                            <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                              client.status === 'Patvirtinta' 
                                ? 'bg-green-600/50' 
                                : 'bg-yellow-600/50'
                            }`}>
                              {client.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-1 border-t border-gray-700 text-gray-400 text-right">
                        Viso: <span className="text-white font-semibold">{weekSums[week.id]}</span>
                      </div>
                    </div>
                    {/* Rodyklė */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-3 text-sm text-gray-700">
        <div>
          Rodyti po
          <select value={pageSize} onChange={(e)=>{ setPageSize(parseInt(e.target.value)); setPage(1) }} className="ml-2 mr-2 px-2 py-1 border border-gray-300 rounded">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={100}>100</option>
          </select>
          įrašų. Iš viso: {filteredAndSortedClients.length}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Ankstesnis</button>
          <span>Puslapis {page} / {totalPages}</span>
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Kitas</button>
        </div>
      </div>

      {/* Modals */}
      <TaskDetailModal
        key={selectedTask?.id || 'no-task'}
        open={isModalOpen}
        onOpenChange={(v) => setIsModalOpen(v)}
        task={selectedTask}
        onSaveReminder={(remindAt: string, message: string) => {
          if (!selectedTask) return
          saveReminder(selectedTask.id, remindAt, message)
        }}
        currentReminder={selectedTask ? getReminder(selectedTask.id) : undefined}
        onSaveDetails={(payload) => {
          console.log('🔧 onSaveDetails called with payload:', payload)
          if (selectedTask) {
            // Iškart sukurti atnaujintą client'ą
            const updatedClient = {
              ...selectedTask,
              ...payload,
              hasWarning: isWarningClient({
                ...selectedTask,
                ...payload
              })
            }
            console.log('🔧 Created updatedClient:', updatedClient)
            
            // Iškart atnaujinti selectedTask
            setSelectedTask(updatedClient)
            console.log('🔧 Setting selectedTask to:', updatedClient)
            
            // Tada išsaugoti į clients state'ą
            saveClientDetails(payload)
          }
        }}
        onDelete={(clientId: string) => deleteClient(clientId)}
      />
      
      <WaitingListModal
        open={isWaitingListOpen}
        onOpenChange={(v) => setIsWaitingListOpen(v)}
      />

      <AddClientModal
        open={isAddClientModalOpen}
        onOpenChange={setIsAddClientModalOpen}
        onAdd={handleAddClient}
      />

      {/* Reminders Popup */}
      {showRemindersPopup && (
        <RemindersPopup
          reminders={reminders}
          clients={clients}
          onClose={handleRemindersPopupClose}
          onMarkCompleted={handleReminderCompleted}
        />
      )}

      {/* Reserved Clients Warning Modal */}
      <ReservedClientsWarningModal
        open={showReservedWarningModal}
        onClose={() => setShowReservedWarningModal(false)}
        clients={clients}
      />
    </div>
  )
}