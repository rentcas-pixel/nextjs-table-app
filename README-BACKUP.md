# Viadukų užimtumas - BACKUP

**Backup data**: 2025-08-20 13:19:04
**Projektas**: Next.js table aplikacija su Supabase

## Kas yra šiame backup'e

✅ **Visi failai ir kodas** iš nextjs-table-app projekto
✅ **Funkcionalumas**:
- Klientų valdymas (CRUD)
- Screenshot'ų ir failų valdymas
- Filtrai, rikiavimas, paginacija
- Supabase duomenų bazės persistencija
- Responsive dizainas

## Kaip atkurti

1. **Sukurti naują katalogą**:
```bash
mkdir nextjs-table-app-restored
cd nextjs-table-app-restored
```

2. **Nukopijuoti visus failus**:
```bash
cp -r ../backup-viadukai-20250820-131904/* .
```

3. **Instaliuoti dependencies**:
```bash
npm install
```

4. **Paleisti aplikaciją**:
```bash
npm run dev
```

## Svarbūs failai

- `components/resource-table.tsx` - Pagrindinė lentelė
- `components/task-detail-modal.tsx` - Klientų redagavimo modal'as
- `lib/supabase.ts` - Supabase konfigūracija
- `app/page.tsx` - Pagrindinis puslapis

## Supabase konfigūracija

Reikia nustatyti environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Pastovus URL

https://nextjs-table-app-stable.vercel.app

## Pastaba

Šis backup'as sukurtas 2025-08-20, kai aplikacija veikė pilnai su visomis funkcijomis.
Jei reikia grįžti į šią versiją, naudoti šį backup'ą.
