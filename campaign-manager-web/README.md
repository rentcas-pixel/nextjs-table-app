# Kampanijų valdymas - Campaign Manager

Moderni Next.js aplikacija kampanijų valdymui su suskleidžiama forma.

## 🚀 Kaip paleisti lokaliai

1. **Įdiegti dependencies:**
```bash
npm install
```

2. **Paleisti development serverį:**
```bash
npm run dev
```

3. **Atidaryti naršyklę:**
```
http://localhost:3000
```

## 🌐 Kaip deployinti į Vercel

### 1. Sukurti GitHub repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/campaign-manager.git
git push -u origin main
```

### 2. Deployinti į Vercel

1. **Eiti į [vercel.com](https://vercel.com)**
2. **Prisijungti su GitHub**
3. **Importuoti repository**
4. **Gauti URL** (pvz., `https://campaign-manager.vercel.app`)

## ✨ Funkcionalumas

- **Suskleidžiama forma** - pagal nutylėjimą paslėpta
- **Modernus UI** - Tailwind CSS
- **Responsive dizainas** - veikia visuose įrenginiuose
- **TypeScript** - tipų saugumas

## 🎯 Formos valdymas

- **"+ Pridėti kampaniją"** - atidaro formą
- **"Uždaryti formą"** - užsidaro forma
- **X mygtukas** - užsidaro formą
- **"Atšaukti"** - užsidaro formą

## 🛠️ Technologijos

- **Next.js 14** - React framework
- **TypeScript** - tipų saugumas
- **Tailwind CSS** - utility-first CSS
- **React Hooks** - state management

## 📱 Responsive dizainas

- **Mobile-first** approach
- **Grid sistema** - automatiškai pritaikosi
- **Breakpoints** - md, lg, xl

## 🔧 Development

```bash
# Development serveris
npm run dev

# Build production
npm run build

# Start production
npm start

# Lint kodą
npm run lint
```

## 📁 Failų struktūra

```
campaign-manager-web/
├── app/
│   ├── page.tsx          # Pagrindinis puslapis
│   ├── layout.tsx        # Layout komponentas
│   └── globals.css       # Globalūs stiliai
├── public/               # Statiniai failai
├── package.json          # Dependencies
└── README.md            # Šis failas
```

## 🚀 Deployment

Aplikacija automatiškai deployinama į Vercel kai pushinate į GitHub main branch.

**URL:** `https://your-app-name.vercel.app`

## 📞 Pagalba

Jei turite klausimų ar problemų:
1. Patikrinkite console'je klaidas
2. Įsitikinkite, kad visi dependencies įdiegti
3. Patikrinkite, ar serveris paleistas

---

**Sukurta su ❤️ naudojant Next.js ir Tailwind CSS**

