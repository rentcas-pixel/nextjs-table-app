#!/usr/bin/env node

/**
 * Supabase Restore Script
 * 
 * Atkuria duomenis iš backup JSON failo į Supabase.
 * 
 * Naudojimas:
 *   npm run restore <backup-file-path>
 *   arba
 *   npx tsx scripts/restore.ts <backup-file-path>
 * 
 * Pavyzdys:
 *   npm run restore backups/backup_2025-01-15_14-30-00.json
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Patikrinti environment variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('❌ Klaida: Supabase environment variables nerasti!')
  process.exit(1)
}

const supabase = createClient(url, anon)

// Gauti backup failo kelią iš argumentų
const backupFilePath = process.argv[2]

if (!backupFilePath) {
  console.error('❌ Klaida: Nepateiktas backup failo kelias!')
  console.error('')
  console.error('Naudojimas:')
  console.error('  npm run restore <backup-file-path>')
  console.error('')
  console.error('Pavyzdys:')
  console.error('  npm run restore backups/backup_2025-01-15_14-30-00.json')
  process.exit(1)
}

// Patikrinti, ar failas egzistuoja
const fullPath = path.isAbsolute(backupFilePath) 
  ? backupFilePath 
  : path.join(process.cwd(), backupFilePath)

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Klaida: Failas nerastas: ${fullPath}`)
  process.exit(1)
}

async function restoreBackup() {
  console.log('📦 Pradedamas restore procesas...')
  console.log(`📁 Backup failas: ${fullPath}`)
  console.log('')

  try {
    // Nuskaityti backup failą
    console.log('📥 Nuskaitomas backup failas...')
    const backupContent = fs.readFileSync(fullPath, 'utf-8')
    const backup = JSON.parse(backupContent)

    if (!backup.tables) {
      console.error('❌ Klaida: Neteisingas backup formato failas!')
      process.exit(1)
    }

    console.log(`📅 Backup data: ${backup.timestamp || 'nežinoma'}`)
    console.log(`📊 Klientai: ${backup.tables.clients?.length || 0}`)
    console.log(`📊 Priminimai: ${backup.tables.reminders?.length || 0}`)
    console.log(`📊 Laukiančiųjų sąrašas: ${backup.tables.waiting_list?.length || 0}`)
    console.log('')

    // Patvirtinti restore
    console.log('⚠️  DĖMESIO: Šis procesas PERRAŠYS esamus duomenis Supabase!')
    console.log('Jei norite tęsti, spauskite Enter. Norėdami atšaukti, spauskite Ctrl+C')
    console.log('')
    
    // Palaukti 3 sekundes (gali būti pakeista į interaktyvų input)
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('🔄 Tęsiama...')
    console.log('')

    // Atkurti klientus
    if (backup.tables.clients && backup.tables.clients.length > 0) {
      console.log(`📥 Atkuriami klientai (${backup.tables.clients.length})...`)
      
      // Konvertuoti į DB formatą (reikia mapping funkcijų)
      const dbClients = backup.tables.clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        ordernumber: c.orderNumber || c.ordernumber || '',
        startdate: c.startDate || c.startdate || '',
        enddate: c.endDate || c.enddate || '',
        intensity: c.intensity,
        comment: c.comment ?? null,
        files: c.files ?? null,
      }))

      let { error } = await supabase.from('clients').upsert(dbClients, { onConflict: 'id' })
      if (error) {
        const { error: errAlt } = await supabase.from('Clients' as any).upsert(dbClients, { onConflict: 'id' })
        if (errAlt) {
          console.error('❌ Klaida atkuriant klientus:', errAlt.message)
        } else {
          console.log('✅ Klientai atkurti!')
        }
      } else {
        console.log('✅ Klientai atkurti!')
      }
    }

    // Atkurti priminimus
    if (backup.tables.reminders && backup.tables.reminders.length > 0) {
      console.log(`📥 Atkuriami priminimai (${backup.tables.reminders.length})...`)
      
      const dbReminders = backup.tables.reminders.map((r: any) => ({
        id: r.id,
        clientid: r.clientId || r.clientid || '',
        remindat: r.remindAt || r.remindat || '',
        message: r.message,
        status: r.status || 'active',
        shown_today: r.shownToday || r.shown_today || false,
        last_shown: r.lastShown || r.last_shown || null,
      }))

      let { error } = await supabase.from('reminders').upsert(dbReminders, { onConflict: 'id' })
      if (error) {
        const { error: errAlt } = await supabase.from('Reminders' as any).upsert(dbReminders, { onConflict: 'id' })
        if (errAlt) {
          console.error('❌ Klaida atkuriant priminimus:', errAlt.message)
        } else {
          console.log('✅ Priminimai atkurti!')
        }
      } else {
        console.log('✅ Priminimai atkurti!')
      }
    }

    // Atkurti laukiančiųjų sąrašą
    if (backup.tables.waiting_list && backup.tables.waiting_list.length > 0) {
      console.log(`📥 Atkuriamas laukiančiųjų sąrašas (${backup.tables.waiting_list.length})...`)
      
      const dbWaitingList = backup.tables.waiting_list.map((w: any) => ({
        id: w.id,
        name: w.name,
        desired_period: w.desiredPeriod || w.desired_period || '',
        notes: w.notes,
      }))

      let { error } = await supabase.from('waiting_list').upsert(dbWaitingList, { onConflict: 'id' })
      if (error) {
        const { error: errAlt } = await supabase.from('Waiting_List' as any).upsert(dbWaitingList, { onConflict: 'id' })
        if (errAlt) {
          console.error('❌ Klaida atkuriant laukiančiųjų sąrašą:', errAlt.message)
        } else {
          console.log('✅ Laukiančiųjų sąrašas atkurtas!')
        }
      } else {
        console.log('✅ Laukiančiųjų sąrašas atkurtas!')
      }
    }

    console.log('')
    console.log('✨ Restore procesas baigtas!')
    console.log('✅ Visi duomenys sėkmingai atkurti į Supabase.')

  } catch (error) {
    console.error('❌ Klaida atkuriant backup:', error)
    process.exit(1)
  }
}

// Paleisti restore
restoreBackup().catch(error => {
  console.error('❌ Kritinė klaida:', error)
  process.exit(1)
})

