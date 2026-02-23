#!/usr/bin/env node

/**
 * Supabase Backup Script
 * 
 * Eksportuoja visus duomenis iš Supabase į JSON failus su timestamp'u.
 * 
 * Naudojimas:
 *   npm run backup
 *   arba
 *   npx tsx scripts/backup.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Patikrinti environment variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('❌ Klaida: Supabase environment variables nerasti!')
  console.error('Patikrinkite, ar nustatyti:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, anon)

// Backup katalogo kelias
const BACKUP_DIR = path.join(process.cwd(), 'backups')

// Sukurti backup katalogą, jei neegzistuoja
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// Timestamp formatas: YYYY-MM-DD_HH-MM-SS
function getTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

async function fetchTableData(tableName: string, altName?: string): Promise<any[]> {
  let { data, error } = await supabase.from(tableName).select('*')
  
  if (error && altName) {
    const { data: altData, error: altError } = await supabase.from(altName as any).select('*')
    if (altError) {
      console.error(`⚠️  Klaida gaunant ${tableName}:`, altError.message)
      return []
    }
    return altData || []
  }
  
  if (error) {
    console.error(`⚠️  Klaida gaunant ${tableName}:`, error.message)
    return []
  }
  
  return data || []
}

async function createBackup() {
  const timestamp = getTimestamp()
  const backupFileName = `backup_${timestamp}.json`
  const backupFilePath = path.join(BACKUP_DIR, backupFileName)

  console.log('📦 Pradedamas backup procesas...')
  console.log(`📅 Timestamp: ${timestamp}`)
  console.log('')

  try {
    // Eksportuoti visus duomenis
    console.log('📥 Eksportuojami duomenys...')
    
    const [clients, reminders, waitingList] = await Promise.all([
      fetchTableData('clients', 'Clients'),
      fetchTableData('reminders', 'Reminders'),
      fetchTableData('waiting_list', 'Waiting_List')
    ])

    console.log(`✅ Klientai: ${clients.length} įrašų`)
    console.log(`✅ Priminimai: ${reminders.length} įrašų`)
    console.log(`✅ Laukiančiųjų sąrašas: ${waitingList.length} įrašų`)
    console.log('')

    // Sukurti backup objektą
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: {
        clients,
        reminders,
        waiting_list: waitingList
      },
      stats: {
        clients: clients.length,
        reminders: reminders.length,
        waiting_list: waitingList.length,
        total: clients.length + reminders.length + waitingList.length
      }
    }

    // Išsaugoti backup failą
    fs.writeFileSync(backupFilePath, JSON.stringify(backup, null, 2), 'utf-8')

    console.log(`✅ Backup sėkmingai sukurtas!`)
    console.log(`📁 Failas: ${backupFilePath}`)
    console.log(`📊 Iš viso įrašų: ${backup.stats.total}`)
    console.log('')

    // Išvalyti senus backup'us (palikti tik paskutinius 30)
    cleanupOldBackups()

    console.log('✨ Backup procesas baigtas!')
    return backupFilePath

  } catch (error) {
    console.error('❌ Klaida kuriant backup:', error)
    process.exit(1)
  }
}

function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()) // Naujausi pirmi

    // Palikti tik paskutinius 30 backup'ų
    const MAX_BACKUPS = 30
    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS)
      console.log(`🧹 Ištrinami seni backup'ai (${toDelete.length} failų)...`)
      toDelete.forEach(file => {
        fs.unlinkSync(file.path)
        console.log(`   🗑️  Ištrintas: ${file.name}`)
      })
    }
  } catch (error) {
    console.error('⚠️  Klaida valant senus backupus:', error)
  }
}

// Paleisti backup
createBackup().catch(error => {
  console.error('❌ Kritinė klaida:', error)
  process.exit(1)
})

