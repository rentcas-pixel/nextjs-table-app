import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('lt-LT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function calculateIntensity(percentage: number): string {
  if (percentage === 100) return 'kas 1 (100%)'
  if (percentage === 50) return 'kas 2 (50%)'
  if (percentage === 25) return 'kas 4 (25%)'
  return `kas ${Math.round(100 / percentage)} (${percentage}%)`
}

// Savaitių generavimo funkcijos
export function generateWeeks(startDate: Date, numberOfWeeks: number = 20): WeekData[] {
  const weeks: WeekData[] = []
  
  for (let i = 0; i < numberOfWeeks; i++) {
    const weekStart = new Date(startDate)
    weekStart.setDate(startDate.getDate() + (i * 7))
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const weekNumber = getWeekNumber(weekStart)
    const year = weekStart.getFullYear()
    
    weeks.push({
      id: `w-${weekNumber}-${year}`,
      weekNumber,
      year,
      startDate: weekStart,
      endDate: weekEnd,
      label: `${year}-${formatDate(weekStart).split('/')[1]}-${formatDate(weekStart).split('/')[0]} W-${weekNumber} ${year}`,
      shortLabel: `W-${weekNumber}`,
      fullLabel: `${year}-${formatDate(weekStart).split('/')[1]}-${formatDate(weekStart).split('/')[0]} W-${weekNumber} ${year}`
    })
  }
  
  return weeks
}

export function getCurrentWeekStart(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Pirmadienis
  return new Date(now.setDate(diff))
}

export function getWeekRange(startDate: Date, endDate: Date): WeekData[] {
  const weeks: WeekData[] = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Pirmadienis
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const weekNumber = getWeekNumber(weekStart)
    const year = weekStart.getFullYear()
    
    weeks.push({
      id: `w-${weekNumber}-${year}`,
      weekNumber,
      year,
      startDate: weekStart,
      endDate: weekEnd,
      label: `${year}-${formatDate(weekStart).split('/')[1]}-${formatDate(weekStart).split('/')[0]} W-${weekNumber} ${year}`,
      shortLabel: `W-${weekNumber}`,
      fullLabel: `${year}-${formatDate(weekStart).split('/')[1]}-${formatDate(weekStart).split('/')[0]} W-${weekNumber} ${year}`
    })
    
    currentDate.setDate(currentDate.getDate() + 7)
  }
  
  return weeks
}

// Naujos funkcijos intensyvumo logikai
export function getIntensityValue(intensity: string): number {
  switch (intensity) {
    case 'kas 1 (100%)':
      return 40
    case 'kas 2 (50%)':
      return 20
    case 'kas 4 (25%)':
      return 10
    default:
      return 40
  }
}

export function getIntensityFrequency(intensity: string): number {
  switch (intensity) {
    case 'kas 1 (100%)':
      return 1
    case 'kas 2 (50%)':
      return 2
    case 'kas 4 (25%)':
      return 4
    default:
      return 1
  }
}

// Funkcija, kuri grąžina savaites, kurios patenka į kliento datų intervalą
export function getClientWeeks(clientStartDate: string, clientEndDate: string, allWeeks: WeekData[]): WeekData[] {
  if (!clientStartDate || !clientEndDate) return []
  
  const start = new Date(clientStartDate)
  const end = new Date(clientEndDate)
  
  return allWeeks.filter(week => {
    // Savaitė patenka, jei jos pradžia arba pabaiga patenka į kliento intervalą
    return (week.startDate >= start && week.startDate <= end) || 
           (week.endDate >= start && week.endDate <= end) ||
           (week.startDate <= start && week.endDate >= end)
  })
}

// Funkcija, kuri grąžina savaičių reikšmes pagal intensyvumą
export function generateWeekValues(clientStartDate: string, clientEndDate: string, intensity: string, allWeeks: WeekData[]): { [weekId: string]: number } {
  const weeks = getClientWeeks(clientStartDate, clientEndDate, allWeeks)
  const weekValues: { [weekId: string]: number } = {}
  
  if (weeks.length === 0) return weekValues
  
  const intensityValue = getIntensityValue(intensity)
  
  // Rūšiuojame savaites pagal datą
  const sortedWeeks = weeks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  
  console.log('Debug - Client weeks:', {
    clientStartDate,
    clientEndDate,
    intensity,
    intensityValue,
    totalWeeks: sortedWeeks.length,
    weeks: sortedWeeks.map(w => ({ week: w.shortLabel, date: w.startDate.toISOString().split('T')[0] }))
  })
  
  // Kiekvienoje savaitėje rodoma ta pati reikšmė (užimtumas)
  sortedWeeks.forEach((week, index) => {
    weekValues[week.id] = intensityValue
    console.log(`Week ${week.shortLabel} (index ${index}): ${intensityValue}`)
  })
  
  return weekValues
}

// Tipai
export interface WeekData {
  id: string
  weekNumber: number
  year: number
  startDate: Date
  endDate: Date
  label: string
  shortLabel: string
  fullLabel: string
}
