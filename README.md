# Viadukų užimtumas - Next.js + Tailwind App

Bridge occupancy management application built with Next.js and Tailwind CSS.

## Features

- 📊 Resource table with weekly data
- 🔒 Sticky sums at the bottom
- 📱 Detail modal (99vw x 90vh)
- ✏️ Date editing capabilities
- 📅 Auto week calculation
- 🎯 Intensity dropdown
- 💬 Comments system (80% right side)
- 📁 File upload zone (20% right side)

## File Structure

```
/app
  /page.tsx              # Main page
  /layout.tsx            # Root layout
  /globals.css           # Global styles
/components
  /resource-table.tsx    # Main table component
  /task-detail-modal.tsx # Detail modal
  /ui
    /button.tsx          # Button component
    /alert-dialog.tsx    # Alert dialog
    /accordion.tsx       # Accordion component
/lib
  /utils.ts              # Utility functions
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```

## Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React Icons

