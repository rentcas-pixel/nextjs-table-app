'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { generateWeeks, getCurrentWeekStart, getClientWeeks } from '../lib/utils'
import { isSupabaseEnabled, uploadFilesToBucket, supabase } from '../lib/supabase'
import AlertDialog from './ui/alert-dialog'

interface TaskDetailModalProps {
	isOpen?: boolean
	onClose?: () => void
	open?: boolean
	onOpenChange?: (open: boolean) => void
	task: any
	onSaveReminder?: (remindAt: string, message: string) => void
	currentReminder?: { remindAt: string; message: string } | undefined
  onSaveDetails?: (payload: { id: string; name?: string; status?: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'; orderNumber?: string; intensity?: string; startDate?: string; endDate?: string; comment?: string; files?: { name: string; size: number }[] }) => void
  onDelete?: (clientId: string) => void
}

export default function TaskDetailModal({ isOpen, onClose, open: controlledOpen, onOpenChange, task, onSaveReminder, currentReminder, onSaveDetails, onDelete }: TaskDetailModalProps) {
  const safeTask = task ?? { id: '', name: '', status: 'Patvirtinta', orderNumber: '', intensity: 'kas 1 (100%)', startDate: '', endDate: '', comment: '', files: [] }

  const allWeeks = useMemo(() => {
    const start = getCurrentWeekStart()
    return generateWeeks(start, 20)
  }, [])

  const clientWeeks = useMemo(() => getClientWeeks(safeTask.startDate, safeTask.endDate, allWeeks), [safeTask.startDate, safeTask.endDate, allWeeks])
  const weekLabel = useMemo(() => clientWeeks.map((w: any) => w.shortLabel).join(', '), [clientWeeks])

  const [name, setName] = useState<string>(safeTask.name)
  const [status, setStatus] = useState<'Patvirtinta' | 'Rezervuota' | 'Atšaukta'>(safeTask.status)
  const [orderNumber, setOrderNumber] = useState<string>(safeTask.orderNumber)
  const [intensity, setIntensity] = useState<string>(safeTask.intensity)
  const [startDate, setStartDate] = useState<string>(safeTask.startDate)
  const [endDate, setEndDate] = useState<string>(safeTask.endDate)
  const [comment, setComment] = useState<string>(safeTask.comment || '')
  const [files, setFiles] = useState<{ name: string; size: number; url?: string }[]>(safeTask.files || [])
  const [previews, setPreviews] = useState<{ name: string; src: string }[]>([])
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [remindAt, setRemindAt] = useState<string>(currentReminder?.remindAt || '')
  const [reminderMsg, setReminderMsg] = useState<string>(currentReminder?.message || '')
  const [fileUrls, setFileUrls] = useState<{ [name: string]: string }>({})
  const [pendingUploads, setPendingUploads] = useState<{ name: string; file: File }[]>([])
  const openedAtRef = React.useRef<number>(0)

  useEffect(() => {
    if (open) openedAtRef.current = Date.now()
    setName(safeTask.name)
    setStatus(safeTask.status)
    setOrderNumber(safeTask.orderNumber)
    setIntensity(safeTask.intensity)
    setStartDate(safeTask.startDate)
    setEndDate(safeTask.endDate)
    setComment(safeTask.comment || '')
    setFiles(safeTask.files || [])
    try {
      const key = `viadukai.filePreviews.${safeTask.id}`
      const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setPreviews(parsed)
        else setPreviews([])
      } else {
        setPreviews([])
      }
    } catch {
      setPreviews([])
    }
  }, [safeTask])

  useEffect(() => {
    setRemindAt(currentReminder?.remindAt || '')
    setReminderMsg(currentReminder?.message || '')
  }, [currentReminder])

  useEffect(() => {
    if (!safeTask.id) return
    try {
      const key = `viadukai.filePreviews.${safeTask.id}`
      const sanitized = (previews || []).map(p => {
        const publicUrl = fileUrls[p.name]
        return publicUrl ? { name: p.name, src: publicUrl } : p
      }).filter(p => p && typeof p.src === 'string' && !p.src.startsWith('blob:'))
      localStorage.setItem(key, JSON.stringify(sanitized))
    } catch {}
  }, [previews, safeTask.id, fileUrls])

  const todayStr = new Date().toISOString().split('T')[0]

  const daysLeft = useMemo(() => {
    const start = safeTask.startDate ? new Date(safeTask.startDate) : null
    if (!start) return null
    const today = new Date()
    today.setHours(0,0,0,0)
    start.setHours(0,0,0,0)
    const diffMs = start.getTime() - today.getTime()
    const d = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return d
  }, [safeTask.startDate])

  const daysWordLt = (d: number) => {
    if (d === 1) return 'diena'
    if (d >= 2 && d <= 9) return 'dienos'
    return 'dienų'
  }

  const isWarning = useMemo(() => {
    if (status !== 'Rezervuota' || !startDate) return false
    const today = new Date()
    const start = new Date(startDate)
    today.setHours(0,0,0,0)
    start.setHours(0,0,0,0)
    const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 14
  }, [status, startDate])

  const dateRangeLabel = useMemo(() => {
    if (startDate && endDate) return `${startDate} - ${endDate}`
    if (startDate) return `${startDate} - …`
    if (endDate) return `… - ${endDate}`
    return ''
  }, [startDate, endDate])

  const maskDate = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '')
    const y = digits.slice(0, 4)
    const m = digits.slice(4, 6)
    const d = digits.slice(6, 8)
    let out = y
    if (m) out += '-' + m
    if (d) out += '-' + d
    return out
  }

  const open = controlledOpen ?? !!isOpen
  const handleClose = () => {
    onOpenChange?.(false)
    onClose?.()
  }


  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || [])
    const mapped = fileList.map(f => ({ name: f.name, size: f.size }))
    const newPreviews = fileList
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ name: f.name, src: URL.createObjectURL(f) }))
    fileList.forEach(f => {
      const url = URL.createObjectURL(f)
      setFileUrls(prev => ({ ...prev, [f.name]: url }))
    })
    setFiles(prev => [...prev, ...mapped])
    setPendingUploads(prev => [...prev, ...fileList.map(f => ({ name: f.name, file: f }))])
    setPreviews(prev => [...prev, ...newPreviews])
    // reset input value so same file can be picked again if needed
    e.currentTarget.value = ''
  }

  const removeFile = async (nameToRemove: string) => {
    // Remove from Supabase Storage if file was uploaded
    if (isSupabaseEnabled && safeTask.id) {
      const fileToRemove = files.find(f => f.name === nameToRemove)
      if (fileToRemove) {
        try {
          // Find the file path in storage
          const { data: filesList } = await supabase.storage.from('uploads').list(safeTask.id)
          const storageFile = filesList?.find((f: any) => f.name.includes(nameToRemove))
          if (storageFile) {
            await supabase.storage.from('uploads').remove([`${safeTask.id}/${storageFile.name}`])
          }
        } catch (error) {
          console.error('Failed to remove file from Supabase Storage:', error)
        }
      }
    }

    setFiles(prev => prev.filter(f => f.name !== nameToRemove))
    setPreviews(prev => {
      const target = prev.find(p => p.name === nameToRemove)
      if (target && target.src.startsWith('blob:')) {
        try { URL.revokeObjectURL(target.src) } catch {}
      }
      return prev.filter(p => p.name !== nameToRemove)
    })
    setFileUrls(prev => {
      const url = prev[nameToRemove]
      if (url && url.startsWith('blob:')) {
        try { URL.revokeObjectURL(url) } catch {}
      }
      const { [nameToRemove]: _, ...rest } = prev
      return rest
    })
    setPendingUploads(prev => prev.filter(p => p.name !== nameToRemove))
  }

  const handleSave = async () => {
    if (!safeTask.id) return handleClose()
    // Upload to Supabase if configured
    if (isSupabaseEnabled && pendingUploads.length > 0) {
      try {
        const uploaded = await uploadFilesToBucket('uploads', safeTask.id, pendingUploads)
        const withUrls = files.map(f => {
          const found = uploaded.find(u => u.name === f.name)
          return found ? { ...f, url: found.url } : f
        })
        setFiles(withUrls)
        setPendingUploads([])
        setFileUrls(prev => {
          const next = { ...prev }
          withUrls.forEach(f => { if (f.url) next[f.name] = f.url })
          return next
        })
        // replace preview src with public URLs so lightbox works after save
        setPreviews(prev => prev.map(p => {
          const found = uploaded.find(u => u.name === p.name)
          return found ? { ...p, src: found.url } : p
        }))
      } catch {}
    }
    onSaveDetails?.({
      id: safeTask.id,
      name,
      status,
      orderNumber,
      intensity,
      startDate,
      endDate,
      comment,
      files
    })
    if (onSaveReminder) {
      onSaveReminder(remindAt, reminderMsg)
    }
    handleClose()
  }

  const handlePaste = (e: ClipboardEvent) => {
    try {
      const dt = e.clipboardData
      if (!dt) return
      const items = dt.items ? Array.from(dt.items) : []
      const filesFromItems = items
        .filter(it => it.kind === 'file' && (!it.type || it.type.startsWith('image/')))
        .map(it => it.getAsFile()).filter(Boolean) as File[]
      // Some browsers/providers only surface files via clipboardData.files
      const filesFromList = dt.files ? Array.from(dt.files).filter(f => !f.type || f.type.startsWith('image/')) : []

      const files = filesFromItems.length > 0 ? filesFromItems : filesFromList
      if (files.length === 0) return
      e.preventDefault()

      const newFiles: { name: string; size: number }[] = []
      const newPreviews: { name: string; src: string }[] = []
      files.forEach((file, idx) => {
        const ts = new Date().toISOString().replace(/[-:T.Z]/g, '')
        const ext = file.type === 'image/png' ? 'png' : (file.type === 'image/webp' ? 'webp' : 'jpg')
        const name = `screenshot-${ts}${files.length > 1 ? '-' + (idx+1) : ''}.${ext}`
        newFiles.push({ name, size: file.size })
        const src = URL.createObjectURL(file)
        newPreviews.push({ name, src })
        setFileUrls(prev => ({ ...prev, [name]: src }))
        setPendingUploads(prev => [...prev, { name, file }])
      })
      setFiles(prev => [...prev, ...newFiles])
      setPreviews(prev => [...prev, ...newPreviews])
    } catch {}
  }

  useEffect(() => {
    if (!open) return
    const handler = (evt: ClipboardEvent) => handlePaste(evt)
    window.addEventListener('paste', handler as any)
    return () => window.removeEventListener('paste', handler as any)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e as any).key === 'Esc') {
        e.stopPropagation()
        handleClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="absolute inset-0 flex items-start md:items-center justify-center overflow-y-auto">
        <div className="bg-white w-full md:max-w-3xl md:my-10 rounded-lg shadow-lg border border-gray-200 mx-auto">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {isWarning && (
                  <span className="text-orange-600" aria-label="alert">⚠️</span>
                )}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{name || 'Naujas klientas'}</h3>
              </div>
              <button aria-label="Close" className="p-2 text-gray-500 hover:text-gray-700" onClick={handleClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">Kliento detalės</div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pavadinimas</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statusas</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Patvirtinta">Patvirtinta</option>
                <option value="Rezervuota">Rezervuota</option>
                <option value="Atšaukta">Atšaukta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Užsakymo Nr.</label>
              <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intensyvumas</label>
              <select value={intensity} onChange={e => setIntensity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="kas 1 (100%)">Kas 1</option>
                <option value="kas 2 (50%)">Kas 2</option>
                <option value="kas 4 (25%)">Kas 4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data nuo</label>
              <input type="date" lang="en-CA" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data iki</label>
              <input type="date" lang="en-CA" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {status === 'Rezervuota' && daysLeft !== null && daysLeft >= 0 && (
                <div className="mt-1 text-xs text-red-600 font-medium">Liko {daysLeft} {daysWordLt(daysLeft)}</div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Komentaras</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Failai / Print screen</label>
              <input type="file" multiple onChange={handleFileInput} className="block w-full text-sm text-gray-600" />
              <div className="mt-1 text-xs text-gray-500">Galite ir įklijuoti ekrano nuotrauką su Cmd/Ctrl+V</div>
              {(files?.length || 0) > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  {files.map(f => (
                    <li key={f.name} className="flex items-center justify-between gap-2">
                      <span className="truncate mr-2">{f.name} <span className="text-gray-400">({Math.round(f.size/1024)} KB)</span></span>
                      <div className="flex items-center gap-2 shrink-0">
                        {fileUrls[f.name] && (
                          <a href={fileUrls[f.name]} download={f.name} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">Atsisiųsti</a>
                        )}
                        <button className="text-red-600 hover:underline text-xs" onClick={() => removeFile(f.name)}>Pašalinti</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {(previews?.length || 0) > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {previews.map(p => (
                    <div key={p.name} className="relative">
                      <button type="button" className="block w-full" onClick={(e) => { e.stopPropagation(); if (Date.now() - openedAtRef.current < 300) return; setLightbox(p.src) }}>
                        <img src={p.src} alt={p.name} className="h-20 w-full object-cover rounded" />
                      </button>
                      <button aria-label="Remove" className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white shadow hover:bg-black/80" onClick={() => removeFile(p.name)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="text-sm text-gray-600 mb-1">Transliacijų laikotarpis: <span className="font-medium text-gray-800">{dateRangeLabel || '—'}</span></div>
                <div className="text-sm text-gray-600">Savaitės: <span className="font-medium text-gray-800">{weekLabel || '—'}</span></div>
              </div>
            </div>

            <div className="md:col-span-2 border-t pt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priminimo data</label>
                  <input type="date" lang="en-CA" value={remindAt} onChange={e => setRemindAt(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priminimo žinutė</label>
                  <input value={reminderMsg} onChange={e => setReminderMsg(e.target.value)} placeholder="Pvz.: perskambinti, patvirtinti užsakymą..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <AlertDialog
              title="Ištrinti klientą?"
              description="Šio veiksmo atšaukti nepavyks. Klientas ir jo priminimai bus pašalinti."
              confirmText="Ištrinti"
              cancelText="Atšaukti"
              onConfirm={() => { if (safeTask.id) onDelete?.(safeTask.id); }}
            >
              <button className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-md bg-red-50 hover:bg-red-100">Ištrinti</button>
            </AlertDialog>

            <div className="flex items-center gap-2">
              <button onClick={handleClose} className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Uždaryti</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Išsaugoti</button>
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/80" onClick={() => setLightbox(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="preview" className="max-h-full max-w-full rounded shadow-2xl" />
            <button
              type="button"
              className="absolute top-4 right-4 p-3 rounded-full bg-black/80 text-white shadow-lg hover:bg-black"
              onClick={(e) => { e.stopPropagation(); setLightbox(null) }}
              aria-label="Uždaryti peržiūrą"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
