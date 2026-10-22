# High-Performance Accessible Dashboard

A React, Vite, and TypeScript application built to handle large datasets while maintaining full accessibility for keyboard users and screen readers. Styled with Tailwind CSS v4 and powered by TanStack Table and TanStack Virtual for table rendering and virtualization.

## Key Features

- **DataGrid (100,000 Rows):**
  - Fast client-side sorting, global search, and column visibility toggles.
  - Array virtualization using `@tanstack/react-virtual` for smooth 60fps scrolling.

- **Timeline (10,000 Events):**
  - Events grouped by day (`YYYY-MM-DD`).
  - Arrow key navigation: `Left`/`Right` to switch between days, `Up`/`Down` to move through events within a selected day.
  - Screen reader announcements using dynamic `aria-live="polite"` regions.

- **Add/Edit Event Modal:**
  - Accessible dialog using `role="dialog"` with `Escape` key close shortcut.
  - Form validation that automatically moves focus to the first invalid field on submit.
  - Real-time state updates across both the DataGrid and Timeline upon saving.

## Architecture Decisions

- **State Management:** Uses React native state (`useState` + `useMemo`) at the `App.tsx` root level. Because data flows top-down, local state avoids unnecessary external state management libraries while keeping updates fast.
- **Virtualization:** Only renders DOM elements currently in the viewport (~20-30 rows at a time), keeping browser performance fast with 100k records in memory.
- **Accessibility (A11y):** Built using Roving Tabindex and ARIA attributes

## Local Setup

- `npm install` – Install dependencies
- `npm run dev` – Start local dev server