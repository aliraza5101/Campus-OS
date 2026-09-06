# CAMPUS OS — DESIGN SYSTEM & TOKENS

This document defines the foundational design system, color palette, typography hierarchy, and geometric layout tokens for **Campus OS**.

---

## 1. Color Palette

### Primary & Brand Colors
- **Brand Primary Indigo**: `#4F46E5` (Tailwind `indigo-600`) — Primary actions, active navigation states, key highlights
- **Primary Hover**: `#4338CA` (Tailwind `indigo-700`) — Button hover states
- **Primary Active**: `#3730A3` (Tailwind `indigo-800`) — Pressed states and deep accents
- **Primary Light Tint**: `#EEF2FF` (Tailwind `indigo-50`) — Active tab backgrounds, badge tints
- **Primary Subtle Border**: `#C7D2FE` (Tailwind `indigo-200`) — Focused inputs, subtle card borders

### Visual Accents & Gradients
- **Campus OS Hero Gradient**: `linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6366F1 100%)` — Profile completion and readiness hero cards
- **Focus Pillar Accent Gradient**: `linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)` — Pillar header cards and milestone containers
- **Admin Stat Card Tint**: `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)` — Executive KPI metric tiles

### Neutrals & Slate Scale
- **Canvas Background**: `#F4F5F8` (Crisp, warm-cool slate neutral)
- **Surface Background**: `#FFFFFF` (Card surfaces, modals, popovers)
- **Sub-Container Background**: `#F8FAFC` (Slate 50 — Table headers, code blocks, empty states)
- **Border Default**: `#E2E8F0` / `#EAECF0` (Slate 200 — Unified card and input borders)
- **Border Light**: `#F1F5F9` (Slate 100 — Dividers and subtle section separators)
- **Text Primary (Headings)**: `#0F172A` (Slate 900 — High-contrast typography)
- **Text Secondary (Body/Labels)**: `#334155` (Slate 700 — Standard paragraph text)
- **Text Muted (Captions/Subtitles)**: `#64748B` (Slate 500 — Timestamps, secondary notes)
- **Text Placeholder**: `#94A3B8` (Slate 400 — Input placeholder text)

### Status & Indicator Colors
- **Success / Completed / Active**: `#10B981` (Emerald 500) / Tint: `#D1FAE5` (Emerald 100)
- **Warning / Needs Attention**: `#F59E0B` (Amber 500) / Tint: `#FEF3C7` (Amber 100)
- **Danger / At Risk / High Priority**: `#EF4444` (Red 500) / Tint: `#FEE2E2` (Red 100)
- **Info / Category Sky**: `#0EA5E9` (Sky 500) / Tint: `#E0F2FE` (Sky 100)
- **Specialization / Category Violet**: `#8B5CF6` (Violet 500) / Tint: `#EDE9FE` (Violet 100)

---

## 2. Typography

Campus OS uses a modern typographic hierarchy optimized for data density and readability:
- **Primary Font**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Secondary Font**: `'Inter', sans-serif`
- **Monospace Font**: `'Fira Code', 'Courier New', monospace` (for code snippets and credentials)

| Scale | Size | Weight | Line Height | Application |
|---|---|---|---|---|
| **H1 / Welcome** | 20px (1.25rem) | Bold (700) | 1.25 | Page titles, header user welcome |
| **Card Title** | 16px (1.0rem) | SemiBold (600) | 1.3 | Card headers, modal titles |
| **Section Header** | 14px (0.875rem) | SemiBold (600) | 1.4 | Table column headers, chart labels |
| **Body Default** | 14px (0.875rem) | Regular (400) | 1.5 | Paragraphs, descriptions, form inputs |
| **Small / Caption** | 12px (0.75rem) | Medium (500) | 1.4 | Timestamps, secondary subtext, metadata |
| **Tiny / Pill** | 11px (0.6875rem) | Bold (700) | 1.2 | Status badges, category pills, tags |

---

## 3. Geometry, Elevation & Spacing

- **Sidebar Width**: `260px` (Desktop fixed) / Full drawer (Mobile)
- **Header Height**: `70px` (Desktop fixed)
- **Card Border Radius**: `16px` (`rounded-2xl`)
- **Button Border Radius**: `10px` (`rounded-xl`)
- **Pill / Badge Radius**: `9999px` (`rounded-full`)
- **Card Internal Padding**: `20px` to `24px`
- **Dashboard Outer Padding**: `24px`
- **Card Shadow**: `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)`
- **Modal Backdrop**: `rgba(15, 23, 42, 0.5)` with `backdrop-blur-sm`
- **Transitions**: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)` for smooth hover feedback
