# Implemented Features

This document tracks all features that have been completed in the Carbon Capture Game.

## Core Game Loop

- **Turn-based progression** - "Next Month" button advances game by one month
- **Time system** - Tracks year (2025-2100) and month
- **CO2 simulation** - Global CO2 increases by 0.5 ppm per month
- **Temperature calculation** - Based on CO2 levels: `(CO2 - 280) × 0.008`
- **Win condition** - Reduce global temperature to +1.0°C
- **Lose conditions** - Temperature reaches +3.0°C OR year reaches 2100

## Interactive World Map

- **SVG-based map** - Multiple map variants available in `assets/maps/`
- **5 granularity levels**:
  - Regions (6 continents)
  - Macro regions (12 zones)
  - Regional zones (21 subdivisions)
  - Subregions (34 areas)
  - Countries (individual nations)
- **Click/keyboard region selection**
- **Hover effects** with brightness and transform
- **Dynamic tooltips** showing region name and stats

## Map Visualization Modes

- **Default/Temperature** - Blue (cool) → Yellow (warm) → Red (hot)
- **Emissions** - Shows total Gt CO2/year per region
- **Renewables** - Shows renewable energy potential scores
- **Economy** - Shows regional GDP in trillions
- **Dynamic legend** updates based on selected view mode
- **Smooth color interpolation** between gradient stops

## Project System

### Three Project Types
| Project | Cost | CO2 Reduction | Income |
|---------|------|---------------|--------|
| Forest/Reforestation | 50 credits | 2 ppm/month | 0 |
| Solar Farm | 100 credits | 1 ppm/month | 2/month |
| Research Lab | 150 credits | 0 | 5/month |

### Project Mechanics
- **Regional effectiveness** - Project effectiveness varies by region based on potential scores
- **Cost multipliers** - Lower costs in regions with high potential
- **Effect multipliers** - Higher CO2 reduction in suitable regions
- **Visual feedback** - Shows bonus/penalty percentages on project buttons
- **Project tracking** - Lists active projects per region with counts and effectiveness

## Climate Data System

- **50+ countries** with comprehensive data
- **Data per country includes**:
  - Population and GDP
  - Total emissions (Gt/year)
  - Per capita emissions
  - Emissions by sector (electricity, transport, industry, buildings, agriculture)
  - Energy mix (renewable, coal, gas, nuclear, oil percentages)
  - Renewable potential scores (solar, wind, forest, carbon capture, geothermal)
  - Project cost/effect multipliers
  - Climate policies (carbon price, net-zero targets)
  - Educational facts
- **Regional aggregation** - Data aggregated for 6 continents

## User Interface

### Top Bar
- Game logo
- Stats strip: Credits, Temperature, CO2, Date
- Stats Info toggle button

### Left Sidebar
- Next Month button
- Restart button
- Granularity selector dropdown
- Map View selector dropdown
- Map legend (dynamic)
- Region Actions panel
- Project build buttons
- Active Projects list
- Global Briefing (news log)

### Region Details Panel
- Region name
- Local temperature (global ± regional offset)
- Regional economy with sector income breakdown
- Emissions breakdown with visual progress bars
- Project effectiveness ratings (1-5 stars)
- Random educational facts
- Per capita emissions with trend indicator

## News Briefing System

- Displays up to 2 most recent messages
- Color-coded messages: good (green), bad (red), neutral (default)
- Messages for:
  - Game start
  - Month advancement (income/CO2 changes)
  - Project construction
  - Win/Lose conditions
  - Insufficient credits

## Income System

- **Base income** from regional GDP and sectors
- **Project income** from Solar and Research Lab projects
- **Fallback minimum** of 5 credits/month
- **Sector breakdown** - Income displayed per sector
- **Income modifiers** tracked per sector from projects

## Visual Design

- **Dark theme** with gradient background
- **CSS custom properties** for consistent theming
- **Responsive layout** using CSS Grid and clamp()
- **Region health colors**: Green → Yellow → Orange → Red
- **Smooth animations** and transitions
- **Panel system** with semi-transparent backgrounds

## Launch Screen

- Game title and tagline
- 3-card information section (Goal, Rules, How to Play)
- Start Game button

## Technical Features

- **Vanilla JavaScript** - No frameworks, lightweight for school computers
- **Vite build system** - Fast development server and builds
- **Keyboard accessibility** - Enter/Space for region selection
- **Geographic coordinate mapping** - SVG pixel to lat/long conversion

---

*Based on: game.js (1,736 lines), climate-data.js (1,744 lines), style.css (996 lines)*
