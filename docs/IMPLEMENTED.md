---
name: implemented
description: Inventory of completed Carbon Capture Game features — core loop, difficulty modes, projects, events, UI — reference snapshot of current behavior.
type: reference
last_reviewed: 2026-04-24
---

# Implemented Features

This document tracks all features that have been completed in the Carbon Capture Game.

## Core Game Loop

- **Turn-based progression** - "Next Month" button advances game by one month
- **Time system** - Tracks year (2025-2100) and month
- **CO2 simulation** - Global CO2 increases by 0.5 ppm per month (modified by difficulty and feedback loops)
- **Temperature calculation** - Based on CO2 levels: `(CO2 - 280) × 0.008`
- **Win condition** - Reduce global temperature to +1.0°C
- **Lose conditions** - Temperature reaches +3.0°C OR year reaches 2100

## Difficulty Modes

Five difficulty levels with varying parameters:

| Mode | CO2 Rate | Starting Budget | Cost Multiplier | Events |
|------|----------|-----------------|-----------------|--------|
| Tutorial | 0.3 ppm/month | $150B | -30% | Off |
| Easy | 0.4 ppm/month | $120B | -15% | Mild |
| Normal | 0.5 ppm/month | $100B | Normal | Normal |
| Hard | 0.6 ppm/month | $80B | +15% | Harsh |
| Extreme | 0.7 ppm/month | $60B | +30% | Extreme |

## Save/Load System

- **Auto-save** - Game automatically saves after each month
- **3 manual save slots** - Save and load game progress
- **Continue game** - Resume from auto-save on launch screen
- **Export/Import** - Export saves as JSON files for backup or sharing
- **Save metadata** - Tracks timestamp, difficulty, and game state

## Interactive World Map

- **SVG-based map** - Multiple map variants available in `assets/maps/`
- **3 granularity levels**:
  - Continents (6 regions)
  - Major Regions (15 zones)
  - Countries (~250 nations)
- **Click/keyboard region selection**
- **Hover effects** with brightness and transform
- **Dynamic tooltips** showing region name and stats
- **Region search** - Search bar to find regions by name with highlighting

## Map Visualization Modes

- **Default/Temperature** - Blue (cool) → Yellow (warm) → Red (hot)
- **Emissions** - Shows total Gt CO2/year per region
- **Renewables** - Shows renewable energy potential scores
- **Economy** - Shows regional GDP in trillions
- **Dynamic legend** updates based on selected view mode
- **Smooth color interpolation** between gradient stops

## Climate Tipping Points

Irreversible climate thresholds that trigger permanent effects:

| Threshold | Name | Effect |
|-----------|------|--------|
| +1.5°C | Arctic Sea Ice Decline | +0.05 ppm/month additional CO2 |
| +2.0°C | Permafrost Methane Release | +0.1 ppm/month from methane |
| +2.5°C | Amazon Rainforest Dieback | +0.08 ppm/month, forest projects 50% less effective |
| +2.8°C | Ocean Circulation Weakening | +0.12 ppm/month, reduced ocean absorption |

- **Visual status panel** - Shows all tipping points with warning/active states
- **Warning indicators** - Alerts when approaching thresholds (within 0.3°C)
- **Irreversible** - Once triggered, effects are permanent

## Climate Feedback Loops

Temperature-dependent effects that accelerate warming:

- **Ice-Albedo Feedback** - Less ice = more heat absorption (starts at +1.5°C)
- **Ocean Saturation** - Warmer oceans absorb less CO2 (starts at 450 ppm)
- **Vegetation Stress** - Extreme temps reduce plant carbon absorption (starts at +2.0°C)
- **Real-time feedback display** - Shows current feedback effect values

## Technology Research System

Research unlocks improved project versions:

| Technology | Cost (RP) | Tier | Effect |
|------------|-----------|------|--------|
| Advanced Photovoltaics | 100 | 1 | Solar: +20% CO2, +15% income |
| Enhanced Forests | 200 | 2 | Reforestation: +30% CO2 reduction |
| Turbine Optimization | 250 | 2 | Offshore Wind: -20% cost, +15% CO2 |
| Modular Nuclear | 500 | 3 | Nuclear: -25% cost, +20% income |
| Green Hydrogen | 750 | 3 | All renewables: +15% income |
| Direct Air Capture | 1000 | 4 | Carbon Capture: 2x CO2 reduction |

- **Research Centers generate 5 RP/month**
- **Collapsible tech tree panel** in sidebar
- **Visual progress tracking** with unlock status

## Random Events System

16 random events across 4 categories:

### Climate Events
- Heat Wave, Hurricane, Drought, Flooding
- Effects: Income/project effectiveness reduction

### Political Events
- Climate Summit, Policy Shift, Fossil Lobby, Youth Movement
- Effects: Income/campaign effectiveness changes

### Economic Events
- Recession, Economic Boom, Oil Crisis
- Effects: Income and cost multipliers

### Breakthrough Events (Permanent)
- Solar Breakthrough, Battery Revolution, CCS Advancement, Fusion Progress
- Effects: Permanent project improvements

- **Probability-based triggering** - 1-3% chance per event per month
- **Duration tracking** - Events last 2-12 months
- **Active events panel** - Shows current events with effects and duration

## Natural Disaster System

Temperature-dependent disaster system with regional vulnerability:

### Disaster Types

| Disaster | Vulnerable Regions | Base Impact | Duration |
|----------|-------------------|-------------|----------|
| Heat Wave | Middle East, South Asia, Mediterranean, Australia | -15% income | 2-3 months |
| Hurricane/Cyclone | Caribbean, Gulf Coast, Southeast Asia | -25% income | 1-2 months |
| Flooding | South/SE Asia, Europe river basins, East Africa | -20% income | 1-2 months |
| Drought | Sub-Saharan Africa, Central Asia, Australia | -20% income | 3-6 months |
| Wildfire | California, Australia, Mediterranean, Amazon | -15% income | 2-4 months |
| Extreme Cold | Northern Europe, Russia, Northern US/Canada | -10% income | 1-2 months |

### Mechanics

- **Temperature scaling** - Higher temperatures = more frequent disasters
- **Regional vulnerability** - Each country has vulnerability scores (0-1) for each disaster type
- **Resilience factor** - Infrastructure quality reduces income impact
- **Geographic realism** - Hurricanes only affect coastal tropical regions, no extreme cold in tropics, etc.

### Political Awareness System

- **Disaster awareness** - Regions hit by disasters become more willing to act on climate
- **Campaign modifier** - Affected regions have easier Climate Policy Campaigns (-3% to -8% difficulty)
- **Awareness decay** - Effect fades by 1% per year without new disasters
- **Strategic choice** - Campaign in disaster-affected regions (easier) or prevention-focused regions (harder)?

### Difficulty Scaling

| Mode | Max New Disasters/Month |
|------|------------------------|
| Tutorial | 0 (disabled) |
| Easy | 1 |
| Normal | 2 |
| Hard | 3 |
| Extreme | 4 |

## Achievement System

15 achievements tracking various gameplay accomplishments:

| Achievement | Requirement |
|-------------|-------------|
| First Steps | Build first project |
| Getting Started | Build 10 projects |
| Renewable Revolution | Build 50 renewable projects |
| Tech Leader | Unlock all technologies |
| Carbon Neutral | Achieve net-zero emissions |
| Climate Champion | Reduce temperature below +1.5°C |
| Speed Run | Win before 2050 |
| Against All Odds | Win on Extreme difficulty |
| Global Coalition | Campaign in 20+ countries |
| Research Pioneer | Accumulate 500 RP |
| Forest Guardian | Plant 25 reforestation projects |
| Nuclear Age | Build 10 nuclear plants |
| Carbon Capture Master | Build 15 CCS facilities |
| Big Spender | Spend $1 trillion |
| Survivor | Reach 2075 without tipping points |

- **Toast notifications** - Animated popup on achievement unlock
- **Collapsible panel** - Shows locked/unlocked achievements
- **Progress tracking** - Tracks total spent, campaign history, etc.

## Project System

### Seven Project Types
| Project | Cost | CO2 Reduction | Income |
|---------|------|---------------|--------|
| Reforestation Program | $5 B | -2 ppm/month | $0 B/month |
| Utility Solar Farm | $10 B | -1 ppm/month | +$2 B/month |
| Wind Farm | $12 B | -1 ppm/month | +$2 B/month |
| Research Center | $15 B | 0 ppm/month | +$3 B/month |
| Offshore Wind | $30 B | -2 ppm/month | +$3 B/month |
| Carbon Capture | $35 B | -4 ppm/month | $0 B/month |
| Nuclear Plant | $50 B | -3 ppm/month | +$4 B/month |

### Project Mechanics
- **Regional effectiveness** - Project effectiveness varies by region based on potential scores
- **Cost multipliers** - Lower costs in regions with high potential
- **Effect multipliers** - Higher CO2 reduction in suitable regions
- **Technology bonuses** - Unlocked techs improve project performance
- **Event modifiers** - Active events can affect project costs and effectiveness
- **Visual feedback** - Shows bonus/penalty percentages on project buttons
- **Project tracking** - Lists active projects per region with counts and effectiveness

## Climate Data System

- **96 countries** with comprehensive real-world data (2024-2025)
- **Data per country includes**:
  - Population and GDP (from IMF World Economic Outlook)
  - Total emissions in Gt/year (from Global Carbon Project)
  - Per capita emissions (tonnes CO2 per person)
  - Emissions trend (% annual change)
  - Emissions by sector (electricity, transport, industry, buildings, agriculture)
  - Energy mix (renewable, coal, gas, nuclear, oil percentages from IEA)
  - Renewable potential scores (solar, wind, forest, carbon capture, geothermal)
  - Project cost/effect multipliers
  - Climate policies:
    - Carbon price (USD/tonne) - EU ETS ~$65, Nordic countries $90-130
    - Net zero targets (year) - Most countries 2050, Germany 2045, Finland 2035
    - Paris Agreement commitment (% reduction target)
  - Climate finance parameters (currentPercent, maxPercent, difficulty, politicalResistance)
  - Educational facts
- **Regional aggregation** - Data aggregated for 6 continents

## Climate Finance System

- **Real-world GDP-based income** - Countries contribute based on their GDP × climate dedication %
- **Climate dedication percentage** - Ranges from 0.3% (low commitment) to 6%+ (high commitment)
- **Monthly income formula**: `(GDP × Climate %) ÷ 12`
- **Country examples**:
  - USA: $30.5T GDP × 0.9% = $22.88 B/month
  - China: $19.2T GDP × 2.5% = $40.00 B/month
  - Germany: $4.7T GDP × 2.0% = $7.83 B/month

## Climate Policy Campaigns

- **Increase country climate dedication** through political advocacy
- **Campaign cost formula**: `GDP × 0.5% × Difficulty`
- **Campaign duration formula**: `12 months × Difficulty × Political Resistance`
- **Climate % increase formula**: `0.2% + (0.3% × (1 - Difficulty))`
- **Event modifiers** - Political events can affect campaign effectiveness
- **Campaign history tracking** - For Global Coalition achievement
- **Difficulty ratings**:
  - Low (0.2-0.4): Germany, UK, France, Sweden, Nordic countries
  - Medium (0.4-0.6): USA, China, India, Brazil
  - High (0.6-0.8): Australia, Canada, Indonesia
  - Very High (0.8-1.0): Saudi Arabia, Russia, Iran

## User Interface

### Top Stats Bar

Compact stats bar displaying 13 key metrics with color-coded risk indicators:

| Stat | Format | Description | Color Coding |
|------|--------|-------------|--------------|
| Budget | `$X B` | Available climate funds | - |
| Income | `+$X/mo` | Monthly income projection | Green (positive), Red (negative) |
| Temp | `+X.XX°C` | Global temperature anomaly | - |
| CO2 | `X ppm` | Atmospheric CO2 concentration | - |
| Net CO2 | `±X.XX` | Net CO2 change per month | Green (negative), Red (positive) |
| Feedback | `+X.XX` | Climate feedback effect | Green (0), Yellow (<0.2), Red (≥0.2) |
| Projects | `X` | Total projects built | - |
| RP | `X(+Y)` | Research points (+ generation rate) | - |
| Campaigns | `X` | Active policy campaigns | - |
| Disasters | `X` | Active natural disasters | Green (0), Yellow (1-2), Red (≥3) |
| Tipping | `X/4` | Tipping points triggered | Green (0), Yellow (1-2), Red (≥3) |
| Years | `X yrs` | Years remaining until 2100 | Yellow (<50), Red (<25) |
| Date | `Mon YYYY` | Current game date | - |

- **Stats Info button** - "?" button shows detailed help panel explaining all stats
- **Click to expand** - Clicking stats bar opens detailed stats info panel
- **Dynamic color classes** - `.stat-good`, `.stat-warning`, `.stat-bad`

### Event Popup System

Modal popups for important game events with visual styling:

| Event Type | Icon | Border Color | Content |
|------------|------|--------------|---------|
| Disaster | 🌪️ | Red | Disaster name, affected region, duration, income impact |
| Tipping Point | ⚠️ | Orange | Threshold reached, permanent effect description |
| Research | 🔬 | Blue | Technology unlocked, benefits description |
| Breakthrough | 💡 | Gold | Breakthrough event, permanent improvements |

- **Auto-dismiss** - Popups close after 5 seconds
- **Click to close** - Can dismiss early by clicking
- **Stacking** - Multiple popups queue and display sequentially
- **Animation** - Fade-in/out transitions

### Left Sidebar
- Next Month button
- Restart button
- Save/Load panel (collapsible)
- Region search bar
- Granularity selector dropdown
- Map View selector dropdown
- Map legend (dynamic)
- Tipping Points panel
- Technology Research panel (collapsible)
- Active Events panel
- Achievements panel (collapsible)
- Region Actions panel
- Project build buttons
- Active Projects list
- Global Briefing (news log with icons)
- Climate History graph (collapsible)

### Region Details Panel
- Region name
- Local temperature (global ± regional offset)
- Regional economy with sector income breakdown
- Emissions breakdown with visual progress bars
- Project effectiveness ratings (1-5 stars)
- Random educational facts
- Per capita emissions with trend indicator

### Climate History Graph
- **Canvas-based visualization** - Shows trends over time
- **Three metrics**: CO2, Temperature, Budget
- **Tab switching** - Toggle between different metrics
- **Statistics panel** - Shows start value, change, and current value
- **Color-coded trends** - Green for improvement, red for decline

## News Briefing System

- **Scrollable log** - Up to 20 messages stored
- **Icons by type** - ✅ good, ⚠️ bad, 📋 neutral
- **Animated entry** - Fade-in animation for new messages
- **Color-coded backgrounds** - Green tint for good, red tint for bad
- **Messages for**:
  - Game start
  - Month advancement (income/CO2 changes)
  - Project construction
  - Achievement unlocks
  - Tipping point warnings and triggers
  - Event notifications
  - Win/Lose conditions
  - Insufficient credits

## Income System

- **Base income** from regional GDP and sectors
- **Project income** from Solar and Research Lab projects
- **Fallback minimum** of 5 credits/month
- **Sector breakdown** - Income displayed per sector
- **Income modifiers** tracked per sector from projects
- **Event multipliers** - Economic events affect income

## Visual Design

- **Dark theme** with gradient background
- **CSS custom properties** for consistent theming
- **Responsive layout** using CSS Grid and clamp()
- **Region health colors**: Green → Yellow → Orange → Red
- **Smooth animations** and transitions
- **Panel system** with semi-transparent backgrounds
- **Achievement toast notifications** - Gold border, animated entry

## Launch Screen

- Game title and tagline
- 3-card information section (Goal, Rules, How to Play)
- **Difficulty selector** - Choose game difficulty
- **Start Game button** - Begin new game
- **Continue Game button** - Resume from auto-save (if available)
- **Auto-save info** - Shows saved game date and difficulty
- Game Rules link

## Technical Features

- **Vanilla JavaScript** - No frameworks, lightweight for school computers
- **Vite build system** - Fast development server and builds
- **Keyboard accessibility** - Enter/Space for region selection
- **Geographic coordinate mapping** - SVG pixel to lat/long conversion
- **LocalStorage persistence** - Save/load game state
- **Canvas rendering** - History graphs with smooth interpolation
- **Event-driven architecture** - Modular event and achievement systems

---

*Based on: game.js, climate-data.js (96 countries with real-world 2024-2025 data), style.css*
