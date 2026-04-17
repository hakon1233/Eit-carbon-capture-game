# Carbon Capture Game - Project Plan

A Plague Inc-inspired web game where players act as a global climate overseer, making strategic decisions to capture carbon and prevent climate catastrophe.

**Target Audience:** Primary school children
**Genre:** Turn-based/real-time strategy
**Platform:** Web browser

> For Norway-specific funding, buyer, and go-to-market strategy, see [`docs/strategy/norway-commercialization.md`](docs/strategy/norway-commercialization.md).

---

## Core Concept: "Climate Overseer"

You're trying to SAVE the world (reverse of Plague Inc)

| Plague Inc | Climate Overseer |
|------------|------------------|
| Disease spreads | CO2/warming spreads |
| Earn DNA points | Earn Green Credits |
| Buy mutations | Buy carbon projects |
| Kill humanity | Save humanity |
| Countries close borders | Countries join your coalition |

---

## Phase 1 - MVP (Minimum Viable Product)

### What the Player Sees

```
┌─────────────────────────────────────────────────┐
│  WORLD MAP (clickable regions)                  │
│  [Europe] [Asia] [Americas] [Africa] [Oceania]  │
│                                                 │
│  Regions show color: Green → Yellow → Red       │
│  (based on local temperature/emissions)         │
├─────────────────────────────────────────────────┤
│  STATS BAR                                      │
│  Credits: 150      Temp: +1.2°C                 │
│  Year: 2025        CO2: 420 ppm                 │
├─────────────────────────────────────────────────┤
│  ACTION PANEL (when region clicked)             │
│  [Plant Forest - 50c]                           │
│  [Solar Farm - 100c]                            │
│  [Research Lab - 150c]                          │
└─────────────────────────────────────────────────┘
```

### MVP Game Loop

```
Every tick (1 second = 1 month):
├── CO2 increases globally (+0.5 ppm)
├── Temperature slowly follows CO2
├── Your projects reduce CO2 in their region
├── You earn credits based on active projects
└── Check win/lose conditions

Win:  Reduce global temp to +1.0°C by 2050
Lose: Temperature hits +3.0°C (catastrophe)
```

### MVP Features

- [ ] 5 clickable regions (simplified world map)
- [ ] 3 project types (forest, solar, research)
- [ ] 2 global stats (CO2, temperature)
- [ ] 1 resource (credits)
- [ ] Simple color feedback (region health)
- [ ] Basic win/lose conditions

### MVP File Structure

```
/game
├── index.html      (single page)
├── style.css       (simple styling)
├── game.js         (game logic)
└── assets/
    └── world-map.svg (simple 5-region map)
```

### MVP Project Types

| Project | Cost | Effect | Description |
|---------|------|--------|-------------|
| Forest | 50c | -2 CO2/tick | Plant trees to absorb carbon |
| Solar Farm | 100c | -1 CO2/tick, +2c/tick | Clean energy + income |
| Research Lab | 150c | +5c/tick | Generates credits for more projects |

---

## Phase 2 - Core Improvements

### 2.1 News Ticker & Events

Random events that affect gameplay:

```
"BREAKING: Heat wave in Europe! Temperature +0.2°C"
"Good news: Asia joins climate coalition! +50 credits"
"Warning: Deforestation in Americas accelerating..."
```

**Event Types:**
- [ ] Natural disasters (negative)
- [ ] Political events (positive/negative)
- [ ] Scientific breakthroughs (positive)
- [ ] Economic events (affect credits)

### 2.2 Project Upgrades

Upgrade paths like Plague Inc's mutation tree:

```
Forest Lv1 → Forest Lv2 → Ancient Forest
   │
   └──→ Mangrove (coastal regions only)

Solar Lv1 → Solar Lv2 → Solar Grid
   │
   └──→ Wind Farm (synergy bonus)
```

**Upgrade Features:**
- [ ] Level system for each project type
- [ ] Branching upgrade paths
- [ ] Region-specific project variants
- [ ] Synergy bonuses for combinations

### 2.3 Region Details Panel

Click a region to see expanded information:

- [ ] Local temperature anomaly
- [ ] List of active projects
- [ ] Population mood indicator
- [ ] Regional special bonuses
- [ ] Emissions breakdown

---

## Phase 3 - Depth & Strategy

### 3.1 Tech Tree

Research unlocks new project types:

```
                ┌─ Carbon Capture Plant (industrial scale)
               │
Research Lab ──├─ Ocean Seeding (experimental)
               │
               ├─ Clean Energy Grid (efficiency boost)
               │
               └─ Climate Education (reduces base emissions)
```

**Tech Tree Features:**
- [ ] Multiple research branches
- [ ] Prerequisite requirements
- [ ] Research time/cost
- [ ] Unlockable advanced projects

### 3.2 Political System

Regions have attitudes toward your efforts:

- [ ] Support meter per region (0-100%)
- [ ] High support = more credits, unlocks projects
- [ ] Low support = projects get cancelled/sabotaged
- [ ] Events affect regional support
- [ ] Diplomatic actions to improve relations

**Support Effects:**
| Support Level | Effect |
|---------------|--------|
| 0-25% | Projects cost 2x, may be cancelled |
| 26-50% | Normal costs |
| 51-75% | 10% discount, bonus credits |
| 76-100% | 25% discount, exclusive projects |

### 3.3 Multiple Resource Types

| Resource | Earned By | Spent On |
|----------|-----------|----------|
| Credits | Time, projects, events | Building projects |
| Research Points | Research labs | Unlocking technology |
| Influence | Good climate results | Political actions |
| Materials | Industrial projects | Advanced buildings |

---

## Phase 4 - Polish & Engagement

### 4.1 Visual Upgrades

- [ ] Animated world map (clouds, weather patterns)
- [ ] Project icons appear on map when built
- [ ] Temperature gradient overlay (blue → red)
- [ ] Particle effects for CO2 emissions/capture
- [ ] Day/night cycle animation
- [ ] Seasonal changes

### 4.2 Achievements & Progression

```
"First Steps"       - Plant your first forest
"Solar Revolution"  - Have 10 solar farms active
"Under 2 Degrees"   - Win with temperature below +2°C
"Speed Runner"      - Win before 2040
"Global Coalition"  - Get all regions to 75%+ support
"Tech Master"       - Unlock all technologies
"Carbon Negative"   - Achieve negative emissions
"Perfect Planet"    - Win without any region going red
```

**Progression System:**
- [ ] Achievement unlock notifications
- [ ] Persistent achievement tracking
- [ ] Unlockable content (new scenarios, cosmetics)
- [ ] Player statistics (games won, total CO2 captured, etc.)

### 4.3 Difficulty Modes

| Mode | CO2 Rate | Credits | Events | Target |
|------|----------|---------|--------|--------|
| Easy | 0.3/tick | 2x | Mostly positive | +1.5°C |
| Normal | 0.5/tick | 1x | Balanced | +1.5°C |
| Hard | 0.7/tick | 0.5x | Mostly negative | +1.5°C |
| Realistic | Variable | 1x | Based on real data | +1.5°C |

### 4.4 Educational Content

Optional popups when building projects:

> "Did you know? One tree absorbs about 22kg of CO2 per year!"

> "Solar panels can last for 25-30 years and produce clean energy!"

> "The Paris Agreement aims to limit warming to 1.5°C above pre-industrial levels."

**Educational Features:**
- [ ] Fact popups (toggleable)
- [ ] "Learn More" links to resources
- [ ] Real-world comparisons
- [ ] Climate glossary

### 4.5 Sound & Music

- [ ] Background ambient music
- [ ] UI sound effects (clicks, builds)
- [ ] Event notification sounds
- [ ] Win/lose fanfares
- [ ] Region-specific ambient sounds

---

## Phase 5 - Advanced Features

### 5.1 Scenarios

Pre-built challenges with unique starting conditions:

| Scenario | Description | Challenge |
|----------|-------------|-----------|
| The Oil Crisis | World dependent on fossil fuels | High starting emissions |
| Island Nations | Small nations at risk | Save vulnerable regions first |
| The Billionaire | Unlimited funds | Very limited time |
| The Activist | Grassroots movement | Low budget, high influence |
| Historical | Start from 1990 | Prevent current crisis |
| 2050 Crisis | Start late | Extreme measures needed |

### 5.2 Multiplayer Modes

**Competitive:**
- Race to save regions
- Compete for limited resources
- Sabotage opponent's projects

**Cooperative:**
- Each player controls different regions
- Shared global stats
- Trade resources
- Coordinate strategies

**Features:**
- [ ] Lobby system
- [ ] Real-time synchronization
- [ ] Chat/communication
- [ ] Leaderboards

### 5.3 Real Data Mode

- [ ] Actual country emissions data
- [ ] Real temperature projections from IPCC
- [ ] Historical climate data
- [ ] Accurate project impact calculations
- [ ] Educational accuracy verification

### 5.4 Sandbox Mode

- [ ] Unlimited resources
- [ ] No win/lose conditions
- [ ] Experiment freely
- [ ] Test strategies

### 5.5 Save/Load System

- [ ] Save game progress
- [ ] Multiple save slots
- [ ] Auto-save feature
- [ ] Cloud saves (optional)

---

## Technical Specifications

### Frontend

- HTML5 / CSS3 / JavaScript
- No framework required for MVP
- Consider Vue.js or React for later phases
- SVG for world map (scalable, interactive)
- CSS animations for visual effects

### Data Storage

- LocalStorage for saves (MVP)
- Consider backend for multiplayer/cloud saves

### Browser Support

- Chrome (primary)
- Firefox
- Safari
- Edge

### Performance Targets

- 60 FPS animations
- < 3 second initial load
- < 100MB total assets

---

## Development Phases Summary

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 - MVP | Core gameplay | Playable game with basic loop |
| 2 | Improvements | Events, upgrades, region details |
| 3 | Depth | Tech tree, politics, resources |
| 4 | Polish | Visuals, audio, achievements |
| 5 | Advanced | Scenarios, multiplayer, real data |

---

## Success Metrics

- Players understand basic climate concepts
- Game is engaging for 10+ minutes
- Clear feedback on actions and consequences
- Easy to learn, room to master
- Runs smoothly on school computers

---

## Open Questions

1. Should the game be purely single-player for MVP?
2. What real-world data sources should we use?
3. Should we include controversial topics (politics, economics)?
4. What age range specifically (6-8, 9-11, etc.)?
5. Should there be teacher/classroom features?

---

## Resources & References

- Plague Inc (gameplay inspiration)
- IPCC Climate Reports (data)
- NASA Climate Kids (educational content)
- Our World in Data (visualizations)
