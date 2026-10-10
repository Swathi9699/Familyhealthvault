# Family Health Vault AI

> **"One simple place to organize your family's health information."**

Family Health Vault AI is a private, family-centric health record and care coordination platform designed to simplify how households track appointments, medications, vital documents, and emergency details.

---

## 1. What the Project Is

Managing medical papers, pediatrician checkups, eldercare prescriptions, immunization records, and allergy lists across family members is often chaotic, scattered across drawers, emails, and patient portals. 

**Family Health Vault AI** brings all of this into a single, warm, intuitive, and accessible interface. It is architected for privacy, clarity, and ease of use, with planned capabilities for secure cloud synchronization and AI-assisted document understanding.

---

## 2. What Phase 2 Includes (Interactive Vault Modules)

This repository is in **Phase 2: Interactive Household Health Vault**:

- **Active Interactive Modules**:
  - `/` — Warm, trustworthy Landing Page with product overview and interactive preview.
  - `/dashboard` — Unified dashboard with live metrics, today's medication tracker, upcoming appointments, and family profiles.
  - `/family` — Full family profiles management (Add, Edit, Delete members, track blood types, critical allergies, chronic conditions, and emergency contacts).
  - `/medicines` — Medication manager with daily compliance checkoff ("Mark Taken Today"), refill tracking with alert notices, and quick "+30 Days Refill".
  - `/appointments` — Clinical schedule with upcoming vs. completed tabs, doctor specialties, visit notes, and physician questions.
  - `/emergency` — High-visibility Emergency Health Card with 1-click text copy, printable formatting (`window.print()`), and direct phone links for EMTs/first responders.
  - `/doctor-summary` — Pre-visit clinical briefing sheet generator organizing symptoms, active meds, and questions for physicians.
  - `/documents` — Document archive categorized by lab reports, immunization records, clinical notes, and insurance forms with search and filtering.
  - `/settings` — Household profile editor, complete JSON backup export & restore, demo data reset, and vault management.
- **Client-Side Persistence (`lib/vault-store.tsx`)**:
  - Reactive React context store with immediate synchronization to `localStorage`.
  - Zero external database required to test full workflows.
  - Full CRUD operations across all entities.

---

## 3. What Is Slated for Phase 3+ (Cloud & AI)

- ⏳ **Cloud Authentication & Sync**: Multi-user login and encrypted cloud synchronization (Supabase / Cloud SQL).
- ⏳ **Gemini AI Document Extraction**: Automatic extraction of medicine names, lab values, and doctor notes from uploaded document photos.
- ⏳ **PDF / File Storage**: Direct file attachments stored in secure bucket storage.

---

## 4. How to Install Dependencies

Make sure you have Node.js (version 18+ or 20+ recommended) and npm installed.

```bash
# Clone or navigate into the project directory
cd family-health-vault-ai

# Install the project dependencies
npm install
```

---

## 5. How to Run the Project (Development Mode)

Start the local development server:

```bash
npm run dev
```

Then open your browser and navigate to:
```
http://localhost:3000
```

You can click around all navigation items in the sidebar or bottom bar to explore the dashboard and preview coming soon modules.

---

## 6. How to Build the Project (Production Mode)

To create an optimized production build:

```bash
npm run build
```

To preview the built static output:

```bash
npm run preview
```

---

## Environment Configuration

Copy `.env.example` to `.env.local` when preparing for future integrations:

```bash
cp .env.example .env.local
```

For Phase 1, no environment variables or API keys are required.
