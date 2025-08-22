'use client'

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseEnabled = Boolean(url && anon)

export const supabase = isSupabaseEnabled
  ? createClient(url, anon)
  : (null as any)

export type UploadResult = { name: string; url: string }

export async function uploadFilesToBucket(bucket: string, clientId: string, files: { name: string; file: File }[]): Promise<UploadResult[]> {
  if (!isSupabaseEnabled) return []
  const results: UploadResult[] = []
  for (const { name, file } of files) {
    const path = `${clientId}/${Date.now()}-${name}`
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
    if (error) {
      try { console.error('Supabase upload error', { bucket, path, error }) } catch {}
      throw error
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path)
    results.push({ name, url: pub.publicUrl })
  }
  try { console.log('Supabase upload results', results) } catch {}
  return results
}

// ----- Database helpers (optional, used when Supabase is enabled) -----
export type ClientRecord = {
  id: string
  name: string
  status: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'
  orderNumber: string
  startDate: string
  endDate: string
  intensity: string
  comment?: string
  files?: { name: string; size: number; url?: string }[]
}

export type ReminderRecord = {
  id: string
  clientId: string
  remindAt: string
  message: string
  status?: string
  shownToday?: boolean
  lastShown?: string
}

export interface WaitingListClient {
  id: string
  name: string
  desiredPeriod: string
  notes: string
}

// Helpers to map camelCase <-> snake/lowercase columns
function toDbClient(c: ClientRecord): any {
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    ordernumber: c.orderNumber,
    startdate: c.startDate,
    enddate: c.endDate,
    intensity: c.intensity,
    comment: c.comment ?? null,
    files: c.files ?? null,
  }
}
function fromDbClient(row: any): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    orderNumber: row.ordernumber ?? row.orderNumber ?? '',
    startDate: row.startdate ?? row.startDate ?? '',
    endDate: row.enddate ?? row.endDate ?? '',
    intensity: row.intensity,
    comment: row.comment ?? '',
    files: row.files ?? [],
  }
}
function toDbReminder(r: ReminderRecord): any {
  return {
    id: r.id,
    clientid: r.clientId,
    remindat: r.remindAt,
    message: r.message,
    status: r.status || 'active',
    shown_today: r.shownToday || false,
    last_shown: r.lastShown || null,
  }
}
function fromDbReminder(row: any): ReminderRecord {
  return {
    id: row.id,
    clientId: row.clientid ?? row.clientId,
    remindAt: row.remindat ?? row.remindAt,
    message: row.message,
    status: row.status || 'active',
    shownToday: row.shown_today || false,
    lastShown: row.last_shown || null,
  }
}

export async function fetchClients(): Promise<ClientRecord[]> {
  if (!isSupabaseEnabled) return []
  // Try lowercase first, then fallback to capitalized table names
  let { data, error } = await supabase.from('clients').select('*')
  if (error) {
    const { data: dataAlt, error: errAlt } = await supabase.from('Clients' as any).select('*')
    if (errAlt) throw errAlt
    return (dataAlt || []).map(fromDbClient)
  }
  return (data || []).map(fromDbClient)
}

export async function upsertClient(client: ClientRecord): Promise<void> {
  if (!isSupabaseEnabled) return
  let { error } = await supabase.from('clients').upsert(toDbClient(client), { onConflict: 'id' })
  if (error) {
    const { error: errAlt } = await supabase.from('Clients' as any).upsert(toDbClient(client), { onConflict: 'id' })
    if (errAlt) throw errAlt
  }
}

export async function deleteClientById(clientId: string): Promise<void> {
  if (!isSupabaseEnabled) return
  let { error } = await supabase.from('clients').delete().eq('id', clientId)
  if (error) {
    const { error: errAlt } = await supabase.from('Clients' as any).delete().eq('id', clientId)
    if (errAlt) throw errAlt
  }
}

export async function fetchReminders(): Promise<ReminderRecord[]> {
  if (!isSupabaseEnabled) return []
  let { data, error } = await supabase.from('reminders').select('*')
  if (error) {
    const { data: dataAlt, error: errAlt } = await supabase.from('Reminders' as any).select('*')
    if (errAlt) throw errAlt
    return (dataAlt || []).map(fromDbReminder)
  }
  return (data || []).map(fromDbReminder)
}

export async function upsertReminder(rec: ReminderRecord): Promise<void> {
  if (!isSupabaseEnabled) return
  let { error } = await supabase.from('reminders').upsert(toDbReminder(rec), { onConflict: 'id' })
  if (error) {
    const { error: errAlt } = await supabase.from('Reminders' as any).upsert(toDbReminder(rec), { onConflict: 'id' })
    if (errAlt) throw errAlt
  }
}

export async function deleteRemindersByClient(clientId: string): Promise<void> {
  if (!isSupabaseEnabled) return
  let { error } = await supabase.from('reminders').delete().eq('clientid', clientId)
  if (error) {
    const { error: errAlt } = await supabase.from('Reminders' as any).delete().eq('clientid', clientId)
    if (errAlt) throw errAlt
  }
}

export async function updateReminderStatus(reminderId: string, status: string, shownToday: boolean = false): Promise<void> {
  if (!isSupabaseEnabled) return
  
  const updateData: any = { status }
  if (shownToday) {
    updateData.shown_today = true
    updateData.last_shown = new Date().toISOString().split('T')[0]
  }
  
  let { error } = await supabase.from('reminders').update(updateData).eq('id', reminderId)
  if (error) {
    const { error: errAlt } = await supabase.from('Reminders' as any).update(updateData).eq('id', reminderId)
    if (errAlt) throw errAlt
  }
}

// Waiting List functions
function toDbWaitingList(w: WaitingListClient): any {
  return {
    id: w.id,
    name: w.name,
    desired_period: w.desiredPeriod,
    notes: w.notes,
  }
}

function fromDbWaitingList(row: any): WaitingListClient {
  return {
    id: row.id,
    name: row.name,
    desiredPeriod: row.desired_period ?? row.desiredPeriod ?? '',
    notes: row.notes,
  }
}

export async function fetchWaitingList(): Promise<WaitingListClient[]> {
  if (!isSupabaseEnabled) return []
  let { data, error } = await supabase.from('waiting_list').select('*')
  if (error) {
    const { data: dataAlt, error: errAlt } = await supabase.from('Waiting_List' as any).select('*')
    if (errAlt) throw errAlt
    return (dataAlt || []).map(fromDbWaitingList)
  }
  return (data || []).map(fromDbWaitingList)
}

export async function upsertWaitingListClient(client: WaitingListClient): Promise<void> {
  if (!isSupabaseEnabled) return
  let { error } = await supabase.from('waiting_list').upsert(toDbWaitingList(client), { onConflict: 'id' })
  if (error) {
    const { error: errAlt } = await supabase.from('Waiting_List' as any).upsert(toDbWaitingList(client), { onConflict: 'id' })
    if (errAlt) throw errAlt
  }
}

export async function deleteWaitingListClient(clientId: string): Promise<void> {
  if (!isSupabaseEnabled) return
  let { error } = await supabase.from('waiting_list').delete().eq('id', clientId)
  if (error) {
    const { error: errAlt } = await supabase.from('Waiting_List' as any).delete().eq('id', clientId)
    if (errAlt) throw errAlt
  }
}