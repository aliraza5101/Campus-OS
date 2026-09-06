# SKKILLO DASHBOARD — REFERENCE ANALYSIS

## 1. Executive Summary
This document provides a comprehensive visual and structural reverse-engineering analysis of the **Skkillo Talent Dashboard** interface from the desktop reference screenshot (approx. 1775 × 866 px viewport).

The interface is a professional, high-clarity web application tailored for tech professionals, creators, and talent seeking to level up skills through company-backed and platform practice challenges, earn badges, track verified proficiency ratings, and showcase credentials to employers.

---

## 2. Layout Structure & Viewport Proportions

### Overall Canvas Geometry
- **Target Resolution**: ~1775px × 866px (Desktop 16:9/16:10 standard dashboard)
- **Base Background**: Light neutral slate `#F8FAFC` / `#F4F5F8`
- **Shell Architecture**:
  1. **Left Navigation Sidebar**:
     - Fixed width: `256px` - `264px`
     - Background: Crisp pure white `#FFFFFF` container with subtle border `#E9ECEF` / `#E2E8F0`
     - Padding: `18px 16px`
     - Contains: Brand Logo, BETA badge, Overview section, Manage section, and pinned bottom Promo Card ("Hurry up").
  2. **Top Header**:
     - Height: `72px`
     - Background: Pure white `#FFFFFF` with bottom border `#F1F5F9`
     - Contains: Left user greeting ("Ali Raza / Welcome Back!"), Center-Right search input, Notification bell with unread badge, Settings gear, and user Avatar with status indicator.
  3. **Main Content Canvas**:
     - Padded container: `24px` horizontal & vertical padding
     - Split Grid Layout:
       - **Left Main Column**: ~`67%` width (approx. 980px at 1775px viewport)
       - **Right Profile Column**: ~`33%` width (approx. 480px at 1775px viewport)
       - Grid Gap: `20px`

---

## 3. Component Hierarchy & Visual Details

### A. Left Sidebar
- **Logo Area**: "Skkillo" brand mark in bold modern sans-serif with vibrant indigo `#4F46E5` accent dot / icon, paired with a small pill badge `BETA` in subtle indigo/violet background `#EEF2FF` and text `#4F46E5`.
- **Navigation Groups**:
  - **Overview Header**: Uppercase small tracked label (`text-xs font-semibold text-slate-400 tracking-wider`)
    - `Dashboard` (Active State: Filled indigo icon `#4F46E5`, crisp indigo text `#4F46E5`, light indigo pill background `#EEF2FF` with subtle left vertical accent or pill highlight)
    - `Company Challenges` (Normal State: slate-600, hover:bg-slate-50)
    - `Professional Skills` (Normal State: slate-600)
    - `Experiences` (Normal State: slate-600)
    - `Projects` (Normal State: slate-600)
    - `Skkillo Challenges` (With `Coming Soon` badge in light slate `#F1F5F9` / `#64748B`)
    - `Groups` (With `Coming Soon` badge)
    - `Inbox` (With `Coming Soon` badge)
  - **Manage Header**:
    - `My Profile`
    - `Settings`
- **Bottom CTA Card**:
  - Background: Soft tinted indigo/slate card `#F1F4FD` or gradient
  - Title: "Hurry up" (font-bold text-slate-900)
  - Subtitle: "Attempt challenges and grow your profile" (text-xs text-slate-500)
  - Action: "Attempt Challenge" (solid indigo button `#4F46E5` with rounded-lg corners)

### B. Top Header
- **User Greeting**:
  - "Ali Raza" (font-bold text-lg text-slate-900 leading-tight)
  - "Welcome Back!" (text-xs font-medium text-slate-500)
- **Global Actions**:
  - Search Input: Pill/rounded-xl search input with magnifying glass icon (`Search challenges, skills, companies...`)
  - Icon Actions: Notification Bell (with subtle ping/dot indicator), Settings Gear button
  - User Avatar: High-res avatar photo with subtle ring border and green online indicator

### C. Top Challenge Cards (Main Column)
1. **Skkillo Challenges Card**:
   - Header: "Skkillo Challenges" + `BETA` pill + `Coming Soon!` pill
   - Body: "Level Up Through Skkillo's Practice Challenges"
   - Graphics: Subtle faded geometric/code mesh background
   - Action: "Coming Soon" button (soft disabled slate style)
2. **Company Challenges Card**:
   - Header: "Company Challenges"
   - Body: "Test Yourself with Company Backed Projects"
   - Graphics: Subtle corporate badge / project decorative motif
   - Action: "Explore Challenges" primary button (solid indigo `#4F46E5` with arrow)

### D. Complete Your Profile Card (Right Column Top)
- **Background**: Rich modern Indigo/Violet gradient (`#3730A3` to `#4F46E5` to `#6366F1`)
- **Header**: "Complete Your Profile" + `60%` badge in white/translucent pill
- **Progress Bar**: Translucent white track with solid bright white or emerald/cyan fill at 60%
- **Subheader**: "3 of 5 done — finish these:"
- **Checklist**:
  1. `✓ Profile photo` (Checked, emerald/green circle check)
  2. `✓ Education` (Checked, emerald/green circle check)
  3. `○ Add your experience` (Unchecked with subtle arrow `>`)
  4. `○ Add a project` (Unchecked with subtle arrow `>`)
  5. `✓ Social links` (Checked, emerald/green circle check)

### E. Professional Skills Card (Main Column Middle)
- **Header**: "Professional Skills" with "View ↗" interactive text link
- **Sub-Cards (2 Columns or Grid)**:
  - **Card 1: Content Creator**:
    - Icon: Cyan/Blue circle with camera/pen icon
    - Title: "Content Creator"
    - Subtitle: "Skill progress from your challenge activity."
    - 4 Metric Blocks:
      - Category: `Content Creator`
      - Proficiency: `Advanced`
      - Points: `0`
      - Rankings: `Level 0`
  - **Card 2: Expert**:
    - Icon: Amber/Orange circle with star/award icon
    - Title: "Expert"
    - Subtitle: "Skill progress from your challenge activity."
    - 4 Metric Blocks:
      - Category: `Expert`
      - Proficiency: `Advanced`
      - Points: `0`
      - Rankings: `Level 0`

### F. Recent Attempts Card (Main Column Middle-Right / Row 2)
- **Header**: "Recent attempts" with "View ↗" link
- **Description**: "Continue in-progress attempts or review completed ones"
- **Empty State Container**:
  - Dotted or soft neutral border container
  - Illustration / subtle icon
  - Copy: "No attempts yet. Start a challenge to see your progress here."

### G. Experience Card (Main Column Bottom-Left)
- **Header**: "Experience" with "View ↗" link
- **Description**: "Recent roles from your profile"
- **Empty State**: "Add work experience to showcase your journey here." with "+ Add Experience" action

### H. Groups Joined Card (Main Column Bottom-Right)
- **Header**: "Groups Joined" with "View ↗" link
- **Content**: "You haven't joined a group yet. Browse groups to connect with peers and employers." with "Explore Groups" action

### I. Profile Card (Right Column Middle & Bottom)
- **Header**: "Profile" with "View ↗" link
- **User Block**: Large circular avatar, "Ali Raza", "Talent" pill/badge
- **Divider**: Crisp slate-100 line
- **Skill Points Section**:
  - Header: "Skill points" with "last 4 months" subtext and "View" link
  - Interactive Multi-Month Chart: Clean SVG Area/Bar chart for `May`, `Jun`, `Jul`, `Aug`
- **Badges Section**:
  - Header: "Badges"
  - Subtext: "Complete challenges to earn badges."
  - Badges grid with locked/unlocked preview states
- **Footer Action**: "See profile" full-width button
