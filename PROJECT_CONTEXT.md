# PROJECT_CONTEXT.md

## Projekto aprašymas

**Viadukų užimtumo valdymo sistema** - Next.js aplikacija, skirta valdyti klientų kampanijas ir jų užimtumą per savaites. Sistema leidžia stebėti reklaminių kampanijų apkrovą viadukuose, valdyti klientų užsakymus ir planuoti resursus.

## Technologijų stack

- **Next.js 14** - React framework
- **React 18** - UI biblioteka
- **TypeScript** - Tipų sistema
- **Tailwind CSS** - Stilių framework
- **Supabase** - Backend-as-a-Service (duomenų bazė + failų saugykla)
- **Lucide React** - Ikonų biblioteka

## Projekto struktūra

```
nextjs-table-app/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Pagrindinis puslapis
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Globalūs stiliai
├── components/                   # React komponentai
│   ├── resource-table.tsx       # Pagrindinė resursų lentelė
│   ├── orders-table.tsx         # Užsakymų lentelė (test versija)
│   ├── task-detail-modal.tsx   # Kliento redagavimo modalas
│   ├── waiting-list-modal.tsx   # Laukiančiųjų sąrašo modalas
│   ├── reminders-popup.tsx      # Priminimų popup
│   └── ui/                      # UI komponentai
│       ├── button.tsx
│       ├── alert-dialog.tsx
│       └── accordion.tsx
├── lib/                         # Bibliotekos ir utilities
│   ├── supabase.ts              # Supabase integracija
│   ├── utils.ts                 # Utility funkcijos
│   └── viadukai.ts              # (ne naudojamas?)
├── scripts/                     # Helper skriptai
│   ├── backup.ts                # Duomenų atsarginė kopija
│   └── restore.ts               # Duomenų atkūrimas
├── public/                      # Statiniai failai
│   └── logo.png
└── *.sql                        # SQL skriptai duomenų bazei
```

## Duomenų modeliai

### ClientData (Klientas)
```typescript
interface ClientData {
  id: string
  name: string                                    // Kliento pavadinimas
  status: 'Patvirtinta' | 'Rezervuota' | 'Atšaukta'  // Statusas
  orderNumber: string                             // Užsakymo numeris
  startDate: string                               // Pradžios data (YYYY-MM-DD)
  endDate: string                                 // Pabaigos data (YYYY-MM-DD)
  intensity: string                               // Intensyvumas: 'kas 1 (100%)' | 'kas 2 (50%)' | 'kas 4 (25%)'
  weeks: { [weekId: string]: number }            // Savaičių reikšmės (užimtumas)
  hasWarning?: boolean                            // Ar turi perspėjimą
  comment?: string                                // Komentaras
  files?: { name: string; size: number; url?: string }[]  // Pridėti failai
}
```

### Reminder (Priminimas)
```typescript
interface Reminder {
  id: string
  clientId: string                                // Kliento ID
  remindAt: string                                // Priminimo data (YYYY-MM-DD)
  message: string                                 // Priminimo žinutė
  status?: string                                 // 'active' | 'completed'
  shownToday?: boolean                            // Ar rodytas šiandien
  lastShown?: string                              // Paskutinio rodymo data
}
```

### WaitingListClient (Laukiančiųjų sąrašas)
```typescript
interface WaitingListClient {
  id: string
  name: string                                    // Kliento pavadinimas
  desiredPeriod: string                           // Norimas periodas (pvz.: "W-45, W-46")
  notes: string                                   // Pastabos
}
```

### WeekData (Savaitės duomenys)
```typescript
interface WeekData {
  id: string                                      // Unikalus ID (pvz.: "w-34-2025")
  weekNumber: number                              // Savaitės numeris
  year: number                                    // Metai
  startDate: Date                                 // Savaitės pradžia
  endDate: Date                                   // Savaitės pabaiga
  label: string                                   // Pilnas labelis
  shortLabel: string                              // Trumpas labelis (pvz.: "W-34")
  fullLabel: string                               // Pilnas labelis
  isYearBoundary?: boolean                        // Ar yra metų riba
}
```

## Pagrindiniai komponentai

### ResourceTable (`components/resource-table.tsx`)
**Pagrindinis komponentas** - rodo visus klientus ir jų užimtumą per savaites.

**Funkcijos:**
- Klientų sąrašas su savaitiniais duomenimis
- Filtravimas ir paieška (pagal pavadinimą, užsakymo numerį, statusą, datas)
- Rūšiavimas (pagal pavadinimą, užsakymo numerį, datas, statusą)
- Puslapiavimas
- Sticky suma eilutė apačioje (rodo visų klientų sumą per savaitę)
- Perspėjimai (raudonas fonas, kai suma > 240)
- Tooltip'ai su klientų sąrašu kiekvienai savaičiai
- Pridėti naują klientą
- Atidaryti kliento redagavimo modalą (double-click arba "Redaguoti" mygtukas)

**State:**
- `clients` - klientų sąrašas
- `reminders` - priminimų sąrašas
- `searchQuery` - paieškos užklausa
- `statusFilter` - statuso filtras
- `dateFromFilter`, `dateToFilter` - datų filtrai
- `sortBy`, `sortDir` - rūšiavimo parametrai
- `page`, `pageSize` - puslapiavimo parametrai

### TaskDetailModal (`components/task-detail-modal.tsx`)
**Kliento redagavimo modalas** - leidžia redaguoti visus kliento duomenis.

**Funkcijos:**
- Redaguoti kliento informaciją (pavadinimas, statusas, užsakymo numeris, datos, intensyvumas)
- Komentarų redagavimas (80% dešinėje)
- Failų įkėlimas (20% dešinėje)
- Failų peržiūra (lightbox)
- Priminimų nustatymas
- Kliento ištrynimas (su patvirtinimu)
- Automatinis savaičių skaičiavimas pagal datas ir intensyvumą

**Props:**
- `open` - ar modalas atidarytas
- `onOpenChange` - callback, kai keičiasi atidarymo būsena
- `task` - kliento duomenys
- `onSaveDetails` - callback, kai išsaugomi duomenys
- `onSaveReminder` - callback, kai išsaugomas priminimas
- `onDelete` - callback, kai ištrinamas klientas
- `currentReminder` - dabartinis priminimas

### WaitingListModal (`components/waiting-list-modal.tsx`)
**Laukiančiųjų sąrašo modalas** - rodo klientus, kurie laukia vietos.

**Funkcijos:**
- Pridėti naują klientą į waiting listą
- Peržiūrėti waiting listo klientus
- Ištrinti klientą iš waiting listo

### RemindersPopup (`components/reminders-popup.tsx`)
**Priminimų popup** - rodo šiandienos priminimus.

**Funkcijos:**
- Automatiškai rodomas, kai yra aktyvūs priminimai šiandienai
- Pažymėti priminimą kaip atliktą
- Uždaryti popup

## Intensyvumo sistema

Sistema naudoja 3 intensyvumo lygius:

| Intensyvumas | Reikšmė | Dažnis | Aprašymas |
|--------------|---------|--------|-----------|
| `kas 1 (100%)` | 40 | Kiekviena savaitė | Visiškai užimta |
| `kas 2 (50%)` | 20 | Kas antra savaitė | Pusiau užimta |
| `kas 4 (25%)` | 10 | Kas ketvirta savaitė | Ketvirtadalis užimta |

**Skaičiavimas:**
- Kiekvienoje savaitėje, kuri patenka į kliento datų intervalą, rodoma ta pati reikšmė (pagal intensyvumą)
- Suma per savaitę = visų klientų reikšmių suma (išskyrus "Atšaukta" statusą)

## Perspėjimų sistema

### Raudonas fonas
- Kai savaitės suma **≥ 240**, rodomas raudonas fonas su baltu tekstu
- Taikoma ir atskiriems klientams, ir sumų eilutei

### Perspėjimai "Rezervuota" klientams
- Jei klientas turi statusą "Rezervuota" ir iki pradžios datos liko **≤ 14 dienų**, rodomas ⚠️ perspėjimas
- Perspėjimas rodomas šalia kliento pavadinimo

## Priminimų sistema

**Funkcionalumas:**
- Galima nustatyti priminimą klientui (data + žinutė)
- Priminimai saugomi Supabase arba localStorage
- Automatiškai rodomas popup, kai priminimo data sutampa su šiandiena
- Galima pažymėti priminimą kaip atliktą
- Priminimai sinchronizuojami tarp įrenginių (jei naudojamas Supabase)

**Saugojimas:**
- Supabase: `reminders` lentelė
- LocalStorage: `viadukai.reminders` raktas

## Duomenų saugojimas

### Supabase (jei sukonfigūruota)
**Lentelės:**
- `clients` - klientų duomenys
- `reminders` - priminimų duomenys
- `waiting_list` - laukiančiųjų sąrašas
- Storage bucket - failų saugykla

**Konfigūracija:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

**Funkcijos (`lib/supabase.ts`):**
- `fetchClients()` - gauti klientus
- `upsertClient()` - išsaugoti/atnaujinti klientą
- `deleteClientById()` - ištrinti klientą
- `fetchReminders()` - gauti priminimus
- `upsertReminder()` - išsaugoti/atnaujinti priminimą
- `updateReminderStatus()` - atnaujinti priminimo statusą
- `fetchWaitingList()` - gauti waiting listą
- `upsertWaitingListClient()` - išsaugoti/atnaujinti waiting list klientą
- `deleteWaitingListClient()` - ištrinti waiting list klientą
- `uploadFilesToBucket()` - įkelti failus į Supabase storage

### LocalStorage (fallback)
Jei Supabase nepasiekiamas, naudojamas localStorage:
- `viadukai.clients` - klientų duomenys
- `viadukai.reminders` - priminimų duomenys
- `viadukai.filePreviews.{clientId}` - failų preview duomenys

## Utility funkcijos (`lib/utils.ts`)

### Savaitių generavimas
- `generateExtendedWeeks()` - generuoja savaites nuo šios savaitės iki 2026 metų pabaigos (~120 savaičių)
- `getCurrentWeekStart()` - grąžina šios savaitės pirmadienį
- `getClientWeeks()` - grąžina savaites, kurios patenka į kliento datų intervalą
- `generateWeekValues()` - generuoja savaičių reikšmes pagal intensyvumą
- `isYearBoundary()` - patikrina, ar savaitė yra metų riboje

### Intensyvumo funkcijos
- `getIntensityValue()` - grąžina reikšmę pagal intensyvumą (40, 20, 10)
- `getIntensityFrequency()` - grąžina dažnį pagal intensyvumą (1, 2, 4)

### Kitos funkcijos
- `formatDate()` - formatuoja datą (lt-LT formatas)
- `getWeekNumber()` - grąžina savaitės numerį
- `calculateIntensity()` - apskaičiuoja intensyvumą pagal procentą
- `cn()` - Tailwind class merge funkcija

## Svarbūs failai

### SQL skriptai
- `add_delete_policy.sql` - Supabase RLS politikos
- `add_reminder_columns.sql` - Priminimų stulpelių pridėjimas
- `create_waiting_list_table.sql` - Waiting list lentelės sukūrimas
- `clear_supabase.sql` - Duomenų bazės valymas

### Backup/Restore skriptai
- `scripts/backup.ts` - Duomenų atsarginė kopija
- `scripts/restore.ts` - Duomenų atkūrimas

## Funkcionalumo aprašymas

### Klientų valdymas
1. **Pridėti klientą:**
   - Užpildyti formą (pavadinimas, statusas, užsakymo numeris, datos, intensyvumas)
   - Validacija: visi laukai privalomi, pabaigos data turi būti po pradžios datos
   - Automatinis savaičių skaičiavimas pagal datas ir intensyvumą

2. **Redaguoti klientą:**
   - Double-click ant eilutės arba "Redaguoti" mygtukas
   - Modal lange galima redaguoti visus duomenis
   - Automatinis išsaugojimas į Supabase/localStorage

3. **Ištrinti klientą:**
   - Modal lange "Ištrinti" mygtukas
   - Patvirtinimo dialogas
   - Ištrinami ir susiję priminimai

### Filtravimas ir rūšiavimas
- **Paieška:** pagal pavadinimą arba užsakymo numerį
- **Statuso filtras:** Visi / Patvirtinta / Rezervuota / Atšaukta
- **Datų filtrai:** nuo/iki datos
- **Rūšiavimas:** pagal pavadinimą, užsakymo numerį, datas, statusą (didėjimo/mažėjimo tvarka)

### Puslapiavimas
- Rodyti po: 5, 10, 20, 100 įrašų
- Navigacija: Ankstesnis / Kitas
- Automatinis puslapio reset'as, kai keičiasi filtrai

### Savaitių rodymas
- Sticky header su savaitės informacija
- Metų ribos pažymėtos žalia spalva
- Dabartinė savaitė pažymėta žalia spalva
- Tooltip'ai su klientų sąrašu (hover ant sumos)
- Sticky suma eilutė apačioje

## UI/UX funkcijos

### Sticky elementai
- Header eilutė (sticky top)
- Pirmi du stulpeliai (Pavadinimas, Status) - sticky left
- Suma eilutė - sticky top (po header)

### Interaktyvumas
- Double-click ant eilutės - atidaro redagavimo modalą
- Hover ant sumos - rodo tooltip su klientų sąrašu
- Keyboard shortcut: 'M' - atidaro pirmo kliento modalą (jei modalas neuždarytas)

### Spalvų sistema
- **Žalia:** Patvirtinta statusas, metų ribos, dabartinė savaitė
- **Raudona:** Rezervuota statusas, perspėjimai (suma ≥ 240)
- **Oranžinė:** Priminimai
- **Pilka:** Neaktyvūs elementai

## Development komandos

```bash
npm run dev      # Paleisti development serverį
npm run build    # Build production versiją
npm start        # Paleisti production serverį
npm run lint     # Paleisti linterį
npm run backup   # Sukurti atsarginę kopiją
npm run restore  # Atkurti duomenis
```

## Pastabos

1. **Supabase integracija:** Sistema automatiškai nustato, ar naudoti Supabase ar localStorage pagal environment kintamuosius
2. **Hydration:** Sistema laukia, kol duomenys bus užkrauti, prieš rodant UI (loading spinner)
3. **Perspėjimų timer:** Kas minutę atnaujinamas perspėjimų būsena
4. **Failų saugojimas:** Failai gali būti saugomi Supabase storage arba localStorage (preview)
5. **Default klientai:** Jei nėra duomenų, naudojami DEFAULT_CLIENTS (test duomenys)

## Ateities plėtros galimybės

- Eksportas į Excel/CSV
- Statistika ir ataskaitos
- Kalendoriaus vaizdas
- Email priminimai
- Vartotojų autentifikacija
- Audit log'as (kas ką keitė)
- Bulk operacijos (masinis redagavimas/ištrynimas)
