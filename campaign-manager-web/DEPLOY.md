# 🚀 Kaip Deployinti į Vercel - Žingsnis po žingsnio

## **1. Sukurti GitHub Repository**

### A) Eikite į GitHub
- Atidarykite [github.com](https://github.com)
- Prisijunkite su savo account

### B) Sukurti naują repository
- Spauskite **"+"** viršutiniame dešiniajame kampe
- Pasirinkite **"New repository"**

### C) Užpildyti informaciją
- **Repository name:** `campaign-manager`
- **Description:** `Modern Campaign Manager with Next.js`
- **Public** ✅ (svarbu!)
- **NEspauskite** "Add a README file"
- Spauskite **"Create repository"**

### D) Nukopijuoti URL
Gausite URL: `https://github.com/YOUR_USERNAME/campaign-manager.git`

---

## **2. Pridėti Remote Origin**

### A) Terminale vykdyti:
```bash
git remote add origin https://github.com/YOUR_USERNAME/campaign-manager.git
git branch -M main
git push -u origin main
```

**Pakeiskite `YOUR_USERNAME` į savo GitHub username!**

---

## **3. Deployinti į Vercel**

### A) Eikite į Vercel
- Atidarykite [vercel.com](https://vercel.com)
- Prisijunkite su **GitHub** (svarbu!)

### B) Importuoti projektą
- Spauskite **"New Project"**
- Pasirinkite **"Import Git Repository"**
- Raskite ir pasirinkite `campaign-manager`
- Spauskite **"Import"**

### C) Konfigūracija
- **Framework Preset:** Next.js (automatiškai)
- **Root Directory:** palikite tuščią
- Spauskite **"Deploy"**

---

## **4. Rezultatas**

Gausite URL: `https://campaign-manager-YOUR_USERNAME.vercel.app`

---

## **🔧 Jei kyla problemų:**

### A) Git klaidos
```bash
git config --global user.name "Jūsų Vardas"
git config --global user.email "jūsų@email.com"
```

### B) Vercel klaidos
- Įsitikinkite, kad repository yra **Public**
- Patikrinkite, ar prisijungėte su **GitHub**

### C) Next.js klaidos
```bash
npm install
npm run build
```

---

## **📞 Pagalba**

Jei vis dar kyla problemų:
1. Patikrinkite, ar visi žingsniai atlikti
2. Įsitikinkite, kad repository yra Public
3. Patikrinkite, ar prisijungėte su GitHub

---

**🎯 Tikslas: Gauti web URL su suskleidžiama forma!**

