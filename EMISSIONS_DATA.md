# Emissions Data Reference

This document details all emissions-related numbers used in the game and what needs verification against real-world data.

---

## Data Sources Currently Used

- IEA World Energy Outlook 2023
- Global Carbon Project 2023
- IPCC AR6 Working Group III
- Our World in Data

---

## 1. Global Totals (Target Values)

| Metric | Game Value | Real World 2023 | Source Needed |
|--------|------------|-----------------|---------------|
| Total CO2 emissions | ~43 Gt/yr | ~37.4 Gt/yr | Global Carbon Project |
| Power sector | ~12 Gt/yr | ~14.5 Gt/yr | IEA |
| Industry | ~14.2 Gt/yr | ~9.4 Gt/yr | IEA |
| Transport | ~8.6 Gt/yr | ~8.0 Gt/yr | IEA |
| Buildings | ~4.1 Gt/yr | ~3.0 Gt/yr | IEA |
| Agriculture | ~5.3 Gt/yr | ~5.8 Gt/yr | IPCC |
| Ocean absorption | 10.0 Gt/yr | ~10.5 Gt/yr | Global Carbon Project |
| Land sink | 3.5 Gt/yr | ~3.5 Gt/yr | Global Carbon Project |

**TODO:** Verify and adjust sector totals to match IEA 2023 breakdown.

---

## 2. Power Sector Emissions

### Emission Factors Used

| Fuel | Factor Used | Real World | Unit | Notes |
|------|-------------|------------|------|-------|
| Coal | 1.0 | 0.82-1.1 | kg CO2/kWh | Varies by coal type |
| Natural Gas | 0.45 | 0.41-0.50 | kg CO2/kWh | Combined cycle vs simple |
| Oil | Not used | 0.65-0.75 | kg CO2/kWh | Should add? |
| Biomass | 0 | 0.03-0.23 | kg CO2/kWh | Lifecycle varies |
| Nuclear | 0 | 0.01-0.02 | kg CO2/kWh | Lifecycle only |
| Hydro | 0 | 0.01-0.02 | kg CO2/kWh | Lifecycle only |
| Wind | 0 | 0.01 | kg CO2/kWh | Lifecycle only |
| Solar | 0 | 0.02-0.05 | kg CO2/kWh | Lifecycle only |

**Location in code:** `public/game.js` lines 665-666
```javascript
const baseCoalEmissions = (currentMix.coal || 0) * 0.001; // 1.0 kg/kWh = 1 Mt/TWh
const baseGasEmissions = (currentMix.gas || 0) * 0.00045; // 0.45 kg/kWh
```

**TODO:**
- [ ] Verify coal emission factor (sub-bituminous vs lignite vs anthracite)
- [ ] Add oil-fired power plants?
- [ ] Consider lifecycle emissions for renewables?

---

## 3. Sector Emissions by Continent

### REGION_AGGREGATES Data (climate-data.js lines 3297-3790)

#### North America
| Sector | Baseline (Gt/yr) | Subsector Breakdown |
|--------|------------------|---------------------|
| Industry | 1.50 | Cement 0.12, Steel 0.25, Chemicals 0.45, Other 0.68 |
| Transport | 2.20 | Road 1.65, Aviation 0.35, Shipping 0.15, Rail 0.05 |
| Buildings | 0.80 | Residential 0.50, Commercial 0.30 |
| Agriculture | 1.00 | Livestock 0.50, Crops 0.35, Land Use 0.15 |
| **Total** | **5.50** | |

**TODO:** Verify against EPA/IEA North America data

#### South America
| Sector | Baseline (Gt/yr) | Subsector Breakdown |
|--------|------------------|---------------------|
| Industry | 0.45 | Cement 0.08, Steel 0.12, Chemicals 0.10, Other 0.15 |
| Transport | 0.55 | Road 0.40, Aviation 0.08, Shipping 0.05, Rail 0.02 |
| Buildings | 0.20 | Residential 0.12, Commercial 0.08 |
| Agriculture | 0.80 | Livestock 0.35, Crops 0.15, Land Use 0.30 |
| **Total** | **2.00** | |

**TODO:** Land use emissions from deforestation - verify Amazon data

#### Europe
| Sector | Baseline (Gt/yr) | Subsector Breakdown |
|--------|------------------|---------------------|
| Industry | 1.20 | Cement 0.15, Steel 0.22, Chemicals 0.35, Other 0.48 |
| Transport | 1.10 | Road 0.75, Aviation 0.20, Shipping 0.10, Rail 0.05 |
| Buildings | 0.70 | Residential 0.45, Commercial 0.25 |
| Agriculture | 0.50 | Livestock 0.25, Crops 0.18, Land Use 0.07 |
| **Total** | **3.50** | |

**TODO:** Verify EU ETS data for industry emissions

#### Africa
| Sector | Baseline (Gt/yr) | Subsector Breakdown |
|--------|------------------|---------------------|
| Industry | 0.35 | Cement 0.10, Steel 0.08, Chemicals 0.05, Other 0.12 |
| Transport | 0.40 | Road 0.30, Aviation 0.05, Shipping 0.04, Rail 0.01 |
| Buildings | 0.18 | Residential 0.13, Commercial 0.05 |
| Agriculture | 0.55 | Livestock 0.20, Crops 0.12, Land Use 0.23 |
| **Total** | **1.48** | |

**TODO:** Verify sub-Saharan vs North Africa split

#### Asia
| Sector | Baseline (Gt/yr) | Subsector Breakdown |
|--------|------------------|---------------------|
| Industry | 10.50 | Cement 2.80, Steel 3.50, Chemicals 2.10, Other 2.10 |
| Transport | 4.20 | Road 3.00, Aviation 0.55, Shipping 0.50, Rail 0.15 |
| Buildings | 2.20 | Residential 1.40, Commercial 0.80 |
| Agriculture | 2.30 | Livestock 1.00, Crops 0.90, Land Use 0.40 |
| **Total** | **19.20** | |

**TODO:**
- [ ] China alone is ~30% of global - verify breakdown
- [ ] India data separate from China
- [ ] Middle East oil economies

#### Oceania
| Sector | Baseline (Gt/yr) | Subsector Breakdown |
|--------|------------------|---------------------|
| Industry | 0.18 | Cement 0.02, Steel 0.04, Chemicals 0.05, Other 0.07 |
| Transport | 0.12 | Road 0.08, Aviation 0.025, Shipping 0.01, Rail 0.005 |
| Buildings | 0.06 | Residential 0.04, Commercial 0.02 |
| Agriculture | 0.10 | Livestock 0.06, Crops 0.025, Land Use 0.015 |
| **Total** | **0.46** | |

**TODO:** Include New Zealand data

---

## 4. Power Generation by Major Region (TWh/year)

### Location in code: MAJOR_REGIONS in climate-data.js

| Region | Coal | Gas | Nuclear | Hydro | Wind | Solar | Other | Total |
|--------|------|-----|---------|-------|------|-------|-------|-------|
| East Asia | 6000 | 960 | 720 | 1680 | 1080 | 1320 | 240 | 12000 |
| South Asia | 1625 | 175 | 75 | 250 | 175 | 175 | 25 | 2500 |
| Southeast Asia | 450 | 280 | 0 | 150 | 20 | 70 | 30 | 1000 |
| West Asia | 98 | 1050 | 42 | 112 | 56 | 28 | 14 | 1400 |
| Central Asia | 81 | 108 | 0 | 68 | 5 | 5 | 3 | 270 |
| North Africa | 14 | 245 | 0 | 35 | 28 | 21 | 7 | 350 |
| Sub-Saharan Africa | 256 | 25 | 18 | 145 | 17 | 42 | 47 | 550 |
| Northern Europe | 18 | 120 | 84 | 180 | 156 | 30 | 12 | 600 |
| Western Europe | 60 | 180 | 480 | 120 | 150 | 90 | 120 | 1200 |
| Southern Europe | 36 | 144 | 72 | 108 | 90 | 72 | 78 | 600 |
| Eastern Europe | 326 | 196 | 284 | 152 | 44 | 28 | 170 | 1200 |
| North America | 770 | 1920 | 865 | 480 | 530 | 290 | 45 | 4900 |
| Central America | 30 | 150 | 10 | 60 | 30 | 20 | 0 | 300 |
| South America | 78 | 232 | 47 | 930 | 155 | 93 | 15 | 1550 |
| Oceania | 120 | 60 | 0 | 21 | 45 | 48 | 6 | 300 |

**TODO:**
- [ ] Verify IEA 2023 electricity generation data by region
- [ ] China vs rest of East Asia breakdown
- [ ] India vs rest of South Asia breakdown

---

## 5. Power Demand Growth Rates

| Region | Growth Rate | Notes |
|--------|-------------|-------|
| East Asia | 4.0%/yr | China slowing, still dominant |
| South Asia | 5.5%/yr | India fastest growing |
| Southeast Asia | 5.0%/yr | Rapid industrialization |
| Sub-Saharan Africa | 6.0%/yr | Lowest base, highest growth |
| North America | 1.8%/yr | Data centers, EVs |
| Europe | 0.8%/yr | Mature, efficiency gains |
| Oceania | 2.0%/yr | Mining, data centers |

**TODO:** Verify against IEA World Energy Outlook projections

---

## 6. Carbon Sinks

### Ocean Absorption
| Parameter | Value | Notes |
|-----------|-------|-------|
| Base absorption | 10.0 Gt/yr | ~26% of emissions |
| Temperature sensitivity | -0.5%/°C | Reduces with warming |

**TODO:** Verify ocean sink capacity and saturation effects

### Land Sink (Natural)
| Parameter | Value | Notes |
|-----------|-------|-------|
| Base absorption | 3.5 Gt/yr | Forests, soil |
| Includes LULUCF | Partially | Land use change separate |

**TODO:** Separate natural sink from managed forests

---

## 7. Emission Factors for Projects

### Forest Projects
| Project Type | Sequestration Rate | Notes |
|--------------|-------------------|-------|
| Reforestation | 0.5 Gt/yr per project | Very high |
| Forest conservation | 0.3 Gt/yr per project | Avoided deforestation |

**TODO:** These seem too high - verify per-hectare rates

### CCS/DAC Projects
| Project Type | Capture Rate | Notes |
|--------------|--------------|-------|
| CCS | 1.0 Gt/yr per project | Industrial CCS |
| DAC | 0.8 Gt/yr per project | Direct air capture |

**TODO:** Current DAC capacity is only ~0.01 Mt/yr globally

---

## 8. Key Conversion Factors

| Conversion | Value | Notes |
|------------|-------|-------|
| CO2 to C | ÷ 3.67 | 44/12 ratio |
| ppm to Gt | × 2.13 | Atmospheric mass |
| Gt to ppm | × 0.47 | Per year accumulation |
| TWh to GW (avg) | ÷ 8.76 | Hours per year |

**Location in code:** `public/game.js` line ~760
```javascript
const GT_TO_PPM = 0.128; // Simplified - should be ~0.47 for atmosphere
```

**TODO:** Verify GT_TO_PPM conversion factor

---

## 9. Data Gaps to Fill

### High Priority
1. [ ] Verify China emissions breakdown (industry, power)
2. [ ] Verify India emissions growth trajectory
3. [ ] Update power generation to 2024 data
4. [ ] Fix GT_TO_PPM conversion factor

### Medium Priority
5. [ ] Add oil-fired power generation
6. [ ] Separate methane from CO2 in agriculture
7. [ ] Add international shipping/aviation (not allocated to regions)
8. [ ] Verify cement/steel industry factors

### Low Priority
9. [ ] Lifecycle emissions for renewables
10. [ ] Embodied carbon factors for construction
11. [ ] Carbon intensity of different coal types

---

## 10. File Locations

| Data | File | Lines |
|------|------|-------|
| REGION_AGGREGATES | `public/climate-data.js` | 3297-3790 |
| MAJOR_REGIONS | `public/climate-data.js` | 296-724 |
| COUNTRY_DATA | `public/climate-data.js` | 780-3296 |
| Power emissions calc | `public/game.js` | 651-685 |
| Sector emissions calc | `public/game.js` | 293-310 |
| Carbon balance calc | `public/game.js` | 717-780 |
| Carbon sinks | `public/game.js` | ~760 |

---

## 11. Recommended Real-World Data Sources

| Source | URL | Data Available |
|--------|-----|----------------|
| Global Carbon Project | globalcarbonproject.org | Annual CO2 budget |
| IEA | iea.org/data-and-statistics | Energy, emissions by country |
| Our World in Data | ourworldindata.org/co2-emissions | Historical, per capita |
| Climate Watch | climatewatchdata.org | NDCs, sectoral data |
| EDGAR | edgar.jrc.ec.europa.eu | Gridded emissions |
| BP Statistical Review | bp.com/statisticalreview | Energy consumption |

---

*Last updated: January 2026*
