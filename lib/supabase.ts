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
export type Campaign = {
  id: string
  startDate: string
  endDate: string
  intensity: string
}

export interface ClientRecord {
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
  createdAt?: string
  updatedAt?: string
  campaigns?: Campaign[]
}

export type ReminderRecord = {
  id: string
  clientId: string
  remindAt: string
  message: string
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
    campaigns: c.campaigns ?? [],
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
    weeks: row.weeks ?? {},
    hasWarning: row.haswarning ?? row.hasWarning ?? false,
    campaigns: row.campaigns ?? [],
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
  }
}
function fromDbReminder(row: any): ReminderRecord {
  return {
    id: row.id,
    clientId: row.clientid ?? row.clientId,
    remindAt: row.remindat ?? row.remindAt,
    message: row.message,
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


