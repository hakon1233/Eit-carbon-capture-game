# Game Data Reference

This document details ALL numerical data used in the Carbon Capture Game, their sources (if any), and what needs verification.

---

## Sources Used and Credibility Ratings

| Source | Credibility | URL | Data Types Used |
|--------|-------------|-----|-----------------|
| **Global Carbon Budget 2025** | ⭐⭐⭐⭐⭐ Very High | [globalcarbonbudget.org/gcb-2025](https://globalcarbonbudget.org/gcb-2025/the-global-carbon-budget-faqs-2025/) | CO2 emissions, carbon sinks, remaining carbon budget |
| **IPCC AR6** | ⭐⭐⭐⭐⭐ Very High | [ipcc.ch](https://www.ipcc.ch/) | Climate thresholds, tipping points, temperature projections |
| **IEA** | ⭐⭐⭐⭐⭐ Very High | [iea.org/data-and-statistics](https://www.iea.org/data-and-statistics) | Energy data, emission factors, electricity prices |
| **IRENA** | ⭐⭐⭐⭐⭐ Very High | [irena.org](https://www.irena.org/Publications/2025/Jun/Renewable-Power-Generation-Costs-in-2024) | Renewable costs, LCOE, capacity factors |
| **Our World in Data** | ⭐⭐⭐⭐ High | [ourworldindata.org](https://ourworldindata.org/co2-emissions) | Aggregated IEA/GCP data, historical trends |
| **World Bank** | ⭐⭐⭐⭐⭐ Very High | [worldbank.org](https://data.worldbank.org/) | GDP growth rates, economic data |
| **NOAA** | ⭐⭐⭐⭐⭐ Very High | [noaa.gov](https://gml.noaa.gov/ccgg/trends/) | Atmospheric CO2 measurements |
| **NREL** | ⭐⭐⭐⭐⭐ Very High | [nrel.gov/analysis/life-cycle-assessment](https://www.nrel.gov/analysis/life-cycle-assessment.html) | Lifecycle emissions, technology data |
| **ND-GAIN** | ⭐⭐⭐⭐ High | [gain.nd.edu](https://gain.nd.edu/our-work/country-index/) | Climate vulnerability indices |
| **Nordhaus DICE** | ⭐⭐⭐⭐ High | Academic papers | GDP-climate damage functions |

### Key Data Verified (January 2026)

**From Global Carbon Budget 2025:**
- Fossil CO2 emissions 2025: **38.1 Gt/year** (1.1% growth)
- Land-use change emissions 2025: **4.1 Gt/year**
- Total CO2 emissions: **~42.2 Gt/year**
- Ocean CO2 sink: **29%** of total emissions (revised upward from 26%)
- Land CO2 sink: **21%** of total emissions (revised downward from 29%)
- Remaining carbon budget for 1.5°C: **~4 years** at current emissions
- Remaining carbon budget for 1.7°C: **525 GtCO2** (12 years)
- Remaining carbon budget for 2.0°C: **1055 GtCO2** (25 years)
- CDR from vegetation: **2.2 GtCO2/year**

**From IRENA 2024 Report:**
- Solar PV LCOE: **$0.043/kWh** ($43/MWh global average)
- Onshore Wind LCOE: **$0.034/kWh** ($34/MWh global average)
- Offshore Wind LCOE: **$0.078-0.080/kWh** ($78-80/MWh)
- 91% of new renewable capacity cheaper than fossil fuel alternatives

**From IPCC AR6:**
- Tipping point risks emerge above **1°C**
- Risks become high around **2°C**
- Risks reach very high around **2.5-4°C**
- Current warming: **~1.2°C** above pre-industrial

**From World Bank GEP January 2025:**
- Global growth: **2.7%** (2025-2026)
- Advanced economies: **~1.5%**
- Emerging markets (EMDEs): **~4%** steady
- Low-income countries: **5-5.7%**
- MENA (oil economies): **3.4-4.1%**

---

## 1. Core Game Configuration (game.js)

### Starting Values
| Parameter | Value | Source |
|-----------|-------|--------|
| Starting Funds | $100 billion | Game design choice |
| Starting CO2 | 420 ppm | NOAA 2024 measurement (~421 ppm) |
| Starting Temperature | +1.2°C | IPCC AR6 (current anomaly ~1.1-1.2°C) |
| Start Year | 2025 | Game design choice |
| Win Temperature | +1.0°C | Game design (below current) |
| Lose Temperature | +3.0°C | IPCC dangerous warming threshold |
| Lose Year | 2100 | Standard climate projection horizon |

### CO2 Climate Constants
| Parameter | Value | Real-World | Source Needed |
|-----------|-------|------------|---------------|
| Base CO2 increase | 0.75 ppm/month | ~2.5 ppm/year actual | NO SOURCE |
| Pre-industrial CO2 | 280 ppm | ~280 ppm | IPCC |
| Temp per ppm factor | 0.008 °C/ppm | ~0.005-0.01 | IPCC climate sensitivity |
| EMISSIONS_TO_PPM_FACTOR | 0.128 | ~0.21 (real) | Tuned for game pace |

**Note:** The `EMISSIONS_TO_PPM_FACTOR` is intentionally ~2x real-world for faster gameplay. Real-world: ~4.7 Gt CO2 = 1 ppm with ~45% airborne fraction.

---

## 2. Economic Growth Configuration

### GDP Growth Rates by Development Level
| Development Level | Game Rate | Real-World (World Bank 2025) | Source |
|-------------------|-----------|------------------------------|--------|
| Developed | 2%/year | **~1.5%** (advanced economies) | [World Bank GEP Jan 2025](https://www.worldbank.org/en/publication/global-economic-prospects) |
| Emerging | 4%/year | **~4%** (EMDEs steady) | World Bank GEP 2025 |
| Developing | 5.5%/year | **5-5.7%** (low-income countries) | World Bank GEP 2025 |
| Oil Economy | 2.5%/year | **3.4-4.1%** (MENA region) | World Bank GEP 2025 |

**World Bank GEP January 2025 Key Findings:**
- Global growth: **2.7%** (2025-2026)
- Emerging market & developing economies (EMDEs): **~4%** steady
- Low-income countries: **5% in 2025**, rising to 5.7% in 2026
- Regional: East Asia 4.6%, South Asia 6.2%, Sub-Saharan Africa 4.1%

### Emissions Intensity (Gt CO2 per 1000 TWh)
| Fuel | Value | Real-World | Source |
|------|-------|------------|--------|
| Coal | 0.9 | 0.82-1.1 | IEA |
| Natural Gas | 0.4 | 0.41-0.50 | IEA |
| Other (Oil) | 0.2 | 0.65-0.75 | ESTIMATE |

### GDP-Climate Impact
| Parameter | Value | Real-World Estimate | Source |
|-----------|-------|---------------------|--------|
| Max GDP growth modifier | 150% | N/A | Game design |
| Min GDP growth modifier | 50% | N/A | Game design |
| GDP penalty start temp | 1.5°C | 1-2°C (damage onset) | IPCC AR6 WG3 |
| GDP penalty rate | -10%/°C above threshold | **1-3%/°C** (traditional), **2.1% at 3°C** (DICE) | Nordhaus DICE model |

**GDP-Climate Damage Research:**
- **Nordhaus DICE model**: 2.1% GDP loss at 3°C, 8.5% at 6°C warming
- **IMF studies**: 7.22% cumulative GDP loss by 2100 without mitigation
- **Traditional estimates**: 1-3% per degree Celsius
- Game uses **-10%/°C** for faster gameplay impact (intentionally ~3-10x real estimates)

---

## 3. Sector Emissions Growth

### Base Annual Growth Rates
| Sector | Rate | Notes | Source |
|--------|------|-------|--------|
| Industry | 2.5%/year | Before modifiers | ESTIMATE |
| Transport | 3%/year | Before modifiers | ESTIMATE |
| Buildings | 2%/year | Before modifiers | ESTIMATE |
| Agriculture | 1.5%/year | Before modifiers | ESTIMATE |

### Growth Modifiers by Development Level
| Level | Industry | Transport | Buildings | Agriculture |
|-------|----------|-----------|-----------|-------------|
| Developed | 0.5x | 0.6x | 0.4x | 0.3x |
| Emerging | 1.2x | 1.5x | 1.0x | 0.8x |
| Developing | 1.8x | 2.0x | 1.5x | 1.0x |
| Oil Economy | 1.0x | 1.2x | 0.8x | 0.5x |

**Source:** All are ESTIMATES based on general economic patterns

### Efficiency Improvement (Annual Reduction)
| Development | Game Rate | Real-World (IEA 2024) | Source |
|-------------|-----------|----------------------|--------|
| Developed | 1.5%/year | **1-1.8%/yr** (global avg) | [IEA Energy Efficiency 2024](https://www.iea.org/energy-efficiency) |
| Emerging | 2%/year | **2.5-4%/yr** (China, India) | IEA 2024 |
| Developing | 2.5%/year | **2-3%/yr** (catch-up effect) | IEA 2024 |
| Oil Economy | 1%/year | **<1%/yr** (less incentive) | ESTIMATE |

**IEA Energy Efficiency 2024 Key Findings:**
- Global average improvement: **1.0-1.8%/yr**
- Industry sector: **<0.5%/yr** (lowest improvement rate)
- Developing economies: **2.5-4%/yr** (catching up to developed world)
- Game values align well with real-world ranges

---

## 4. Natural Carbon Sinks

### Ocean Sink
| Parameter | Game Value | Real-World (GCB 2025) | Status | Source |
|-----------|------------|----------------------|--------|--------|
| Base absorption | **12.2 Gt/year** | 12.2 Gt/year (29% of 42.2 Gt) | ✅ MATCH | [GCB 2025](https://globalcarbonbudget.org/gcb-2025/) |
| Saturation start | 450 ppm | Research varies | ESTIMATE |
| Saturation rate | -2%/10 ppm | Research varies | ESTIMATE |
| Temp impact | -5%/0.5°C above 1.5°C | 7% smaller than without climate change | GCB 2025 |

### Land Sink (Natural)
| Parameter | Game Value | Real-World (GCB 2025) | Status | Source |
|-----------|------------|----------------------|--------|--------|
| Base absorption | **8.9 Gt/year** | 8.9 Gt/year (21% of 42.2 Gt) | ✅ MATCH | [GCB 2025](https://globalcarbonbudget.org/gcb-2025/) |
| Saturation start | 2.0°C | Research varies | ESTIMATE |
| Saturation rate | -10%/0.5°C | 25% smaller than without climate change | GCB 2025 |

**Note:** Game now matches GCB 2025 data. Combined sinks absorb ~50% of anthropogenic CO2 (21.1 Gt/yr total).

---

## 5. Embodied Carbon (Clean Tech Manufacturing)

| Technology | Game Value (Gt CO2/GW) | Real-World Lifecycle | Unit | Source |
|------------|------------------------|---------------------|------|--------|
| Solar | 0.0015 | **6-43 gCO2/kWh** | Lifecycle | [NREL LCA](https://www.nrel.gov/analysis/life-cycle-assessment.html) |
| Wind | 0.0008 | **4 gCO2/kWh** | Lifecycle | IPCC/NREL |
| Offshore Wind | 0.001 | **8-16 gCO2/kWh** | Lifecycle | IPCC/NREL |
| Nuclear | 0.002 | **4-12 gCO2/kWh** | Lifecycle | IPCC/NREL |
| Hydropower | 0.003 | **4-14 gCO2/kWh** | Lifecycle | IPCC/NREL |
| Geothermal | 0.0012 | **15-55 gCO2/kWh** | Lifecycle | IPCC/NREL |
| Battery Storage | 0.05 Gt/GWh | **61-106 gCO2/kWh** | Manufacturing | NREL |

**Lifecycle Emissions Research (IPCC/NREL):**
- **Nuclear**: 4-12 gCO2/kWh (median ~12g, among lowest)
- **Wind**: ~4 gCO2/kWh (lowest lifecycle emissions)
- **Solar PV**: 6-43 gCO2/kWh (varies by tech and location)
- **Coal**: 820-1200 gCO2/kWh (for comparison)
- **Natural Gas**: 410-520 gCO2/kWh (for comparison)

**Note:** Game uses "Gt CO2 per GW installed" as simplified upfront manufacturing cost. Real LCA includes entire lifecycle (manufacturing, operation, decommissioning).

---

## 6. Climate Tipping Points

| Tipping Point | Game Threshold | Effect (ppm/month) | IPCC AR6 Threshold | Source |
|---------------|----------------|-------------------|-------------------|--------|
| Arctic Sea Ice | 1.4°C | +0.08 | **>1.0°C** (risks emerge) | [IPCC AR6](https://climatetippingpoints.info/2021/10/31/ipcc-ar6-climate-tipping-points-feedbacks/) |
| Permafrost Methane | 1.7°C | +0.15 | **~1.5-2.0°C** | IPCC AR6 |
| Amazon Dieback | 2.1°C | +0.12 (+ -50% forest effectiveness) | **~2.0-2.5°C** | IPCC AR6 |
| Ocean Circulation (AMOC) | 2.4°C | +0.18 (+ -30% ocean absorption) | **~2.5-3.0°C** (very unlikely before 2100) | IPCC AR6 |

**IPCC AR6 Key Findings:**
- Tipping point risks **emerge above 1°C** of warming
- Risks become **high around 2°C**
- Risks reach **very high around 2.5-4°C**
- Current warming: **~1.2°C** above pre-industrial (we are already in the risk zone)

**Note:** Game thresholds are slightly tightened from IPCC estimates for gameplay challenge. Effect magnitudes (ppm/month) are GAME DESIGN, not real science.

---

## 7. Feedback Loops

| Feedback | Start | Max | Max Effect (ppm/month) | Source |
|----------|-------|-----|----------------------|--------|
| Ice-Albedo | 1.5°C | 3.0°C | +0.05 | IPCC concept, magnitude is ESTIMATE |
| Ocean Saturation | 450 ppm | 550 ppm | +0.08 | IPCC concept, magnitude is ESTIMATE |
| Vegetation Stress | 2.0°C | 3.0°C | +0.04 | IPCC concept, magnitude is ESTIMATE |

---

## 8. Power Grid Configuration

### Grid Stability
| Parameter | Value | Source |
|-----------|-------|--------|
| Base electricity price | $0.12/kWh | Global average, IEA |
| Critical stability | 30 | Game design |
| Warning stability | 50 | Game design |
| Good stability | 70 | Game design |
| Excellent stability | 90 | Game design |
| Variable penalty factor | -60 at 100% variable | ESTIMATE |
| Storage mitigation | +40 per storage ratio | ESTIMATE |
| Max storage mitigation | 80% | ESTIMATE |
| Baseload bonus | +25 at 100% baseload | ESTIMATE |
| Shortfall penalty | -40 at 100% shortfall | ESTIMATE |

### Price Thresholds
| Level | Price ($/kWh) | Source |
|-------|---------------|--------|
| Cheap | $0.08 | Market observation |
| Normal | $0.12 | IEA global average |
| Expensive | $0.20 | Market observation |
| Crisis | $0.30 | Market observation |

### Capacity Factors
| Generation Type | Factor | Real-World | Source |
|-----------------|--------|------------|--------|
| Solar | 0.20 | 0.15-0.25 | IEA/IRENA |
| Wind (onshore) | 0.30 | 0.25-0.35 | IEA/IRENA |
| Offshore Wind | 0.40 | 0.35-0.50 | IEA/IRENA |
| Nuclear | 0.90 | 0.85-0.93 | IEA |
| Coal | 0.50 | 0.40-0.60 | IEA |
| Natural Gas | 0.45 | 0.40-0.55 | IEA |
| Geothermal | 0.80 | 0.75-0.90 | IEA |
| Hydropower | 0.40 | 0.30-0.55 | IEA (seasonal) |
| Battery Storage | 0.15 | Varies | Grid operator data |
| Pumped Hydro | 0.25 | Varies | Grid operator data |

---

## 9. Project Costs and Effects

### Climate/Environment Projects
| Project | Cost ($B) | CO2 Reduction | Construction (months) | Source |
|---------|-----------|---------------|----------------------|--------|
| Reforestation | 7.5 | 2 units | 4 | ESTIMATE |
| Carbon Capture | 52.5 | 4 units | 30 | NO SOURCE |
| Research Center | 22.5 | 0 (3 income) | 18 | NO SOURCE |

### Variable Power (Solar/Wind)
| Project | Cost ($B) | Capacity (GW) | Stability | Construction | Real-World Cost | Source |
|---------|-----------|---------------|-----------|--------------|-----------------|--------|
| Utility Solar | 15 | 0.5 | -5 | 9 mo | **~$0.7-1B/GW** | [IRENA 2024](https://www.irena.org/Publications/2025/Jun/Renewable-Power-Generation-Costs-in-2024) |
| Wind Farm | 18 | 0.3 | -4 | 15 mo | **~$1.2-1.5B/GW** | IRENA 2024 |
| Offshore Wind | 45 | 0.8 | -3 | 30 mo | **~$2.5-4B/GW** | IRENA 2024 |

**IRENA 2024 LCOE Data:**
- Solar PV: **$0.043/kWh** ($43/MWh) global average
- Onshore Wind: **$0.034/kWh** ($34/MWh) global average - cheapest source
- Offshore Wind: **$0.078-0.080/kWh** ($78-80/MWh)
- **91% of new renewable capacity** is now cheaper than fossil fuel alternatives

**Note:** Game costs are significantly higher than real-world per-GW costs. This is intentional for game balance.

### Baseload Power
| Project | Cost ($B) | Capacity (GW) | CO2 Effect | Stability | Construction | Source |
|---------|-----------|---------------|------------|-----------|--------------|--------|
| Nuclear | 75 | 1.2 | +3 | +15 | 84 mo | ~$6-10B/GW real |
| Coal | 8 | 1.0 | -3 | +10 | 48 mo | ~$1-2B/GW real |
| Natural Gas | 12 | 0.8 | -1.5 | +8 | 24 mo | ~$0.8-1.5B/GW real |
| Geothermal | 35 | 0.3 | +1 | +8 | 36 mo | ~$3-5B/GW real |
| Hydropower | 50 | 0.5 | +1.5 | +12 | 60 mo | ~$2-4B/GW real |

### Energy Storage
| Project | Cost ($B) | Power (GW) | Storage (GWh) | Stability | Source |
|---------|-----------|------------|---------------|-----------|--------|
| Battery | 20 | 0.2 | 0.8 | +15 | ~$200-400M/GWh real |
| Pumped Hydro | 40 | 0.5 | 6.0 | +20 | ~$50-100M/GWh real |

### Economic Projects
| Project | Cost ($B) | Income | GDP Boost | Happiness | Source |
|---------|-----------|--------|-----------|-----------|--------|
| Infrastructure | 30 | 4.5 | +2% | +10 | ESTIMATE |
| Education Hub | 22.5 | 3 | +1% | +15 | ESTIMATE |
| Healthcare | 37.5 | 3 | +1% | +20 | ESTIMATE |
| Trade Agreement | 15 | 6 | +3% | +5 | ESTIMATE |
| Tourism | 18 | 4.5 | +2% | +8 | ESTIMATE |

### Electrification Projects
| Project | Cost ($B) | Power Demand Increase | Sector Reduction | Source |
|---------|-----------|----------------------|------------------|--------|
| EV Infrastructure | 25 | +5% | Road -15% | ESTIMATE |
| Heat Pumps | 15 | +8% | Residential -20% | ESTIMATE |
| Industrial Electrification | 40 | +10% | Industry -10% | ESTIMATE |

---

## 10. Technology Tree

| Technology | RP Cost | Effect | Source |
|------------|---------|--------|--------|
| Advanced Photovoltaics | 100 | Solar +20% CO2, +15% income | Game design |
| Turbine Optimization | 250 | Offshore -20% cost, +15% CO2 | Game design |
| Bioengineered Trees | 200 | Forest +30% CO2 | Game design |
| Small Modular Reactors | 500 | Nuclear -25% cost, +20% income | Game design |
| Direct Air Capture | 1000 | Carbon Capture +100% CO2 | Game design |
| Green Hydrogen | 750 | All renewables +15% income | Game design |

**Research Points per Center:** 5 RP/month (NO SOURCE)

---

## 11. Research Centers

| Center | Build Cost ($B) | Monthly Cost ($B) | RP/Month | Tech Discount |
|--------|-----------------|-------------------|----------|---------------|
| Solar Research | 8 | 0.4 | 8 | Renewable -10% |
| Wind Research | 6 | 0.3 | 6 | Renewable -8% |
| Carbon Capture Hub | 10 | 0.5 | 10 | Carbon -12% |
| DAC Center | 12 | 0.6 | 9 | Carbon -15% |
| Storage Lab | 7 | 0.35 | 7 | Efficiency -10% |
| Smart Grid Center | 5 | 0.25 | 5 | Efficiency -8% |
| Climate Resilience | 15 | 0.8 | 12 | Adaptation -15% |
| Sustainable Agriculture | 4 | 0.2 | 4 | Adaptation -6% |

**Source:** All values are ESTIMATES loosely based on real R&D facility costs.

---

## 12. Difficulty Modes

| Mode | CO2 Multiplier | Starting Funds ($B) | Cost Multiplier | Event Severity |
|------|----------------|---------------------|-----------------|----------------|
| Tutorial | 0.6x | 150 | 0.7x | None |
| Easy | 0.8x | 120 | 0.85x | 0.5x |
| Normal | 1.0x | 100 | 1.0x | 1.0x |
| Hard | 1.2x | 80 | 1.15x | 1.5x |
| Extreme | 1.4x | 60 | 1.3x | 2.0x |

---

## 13. Random Events

### Climate Events
| Event | Probability | Duration (months) | Income Effect |
|-------|-------------|-------------------|---------------|
| Heat Wave | 3% | 3 | -10% |
| Hurricane | 2.5% | 2 | -15% effectiveness |
| Drought | 2.5% | 4 | -15% income |
| Flooding | 2% | 2 | -20% effectiveness, -10% income |

### Political Events
| Event | Probability | Duration (months) | Effect |
|-------|-------------|-------------------|--------|
| Climate Summit | 2% | 6 | +15% income |
| Policy Shift | 2% | 12 | +25% campaign effectiveness |
| Fossil Lobby | 2.5% | 6 | +10% costs, -20% campaigns |
| Youth Movement | 2% | 8 | +30% campaign effectiveness |

### Economic Events
| Event | Probability | Duration (months) | Effect |
|-------|-------------|-------------------|--------|
| Recession | 1.5% | 12 | -25% income |
| Green Boom | 2% | 8 | +20% income, -10% costs |
| Oil Crisis | 2% | 6 | -10% income, +10% renewable effectiveness |

### Breakthroughs (Permanent)
| Event | Probability | Effect |
|-------|-------------|--------|
| Solar Breakthrough | 1% | Solar +15% CO2 reduction |
| Battery Revolution | 1% | Solar/Wind +20% income |
| CCS Advancement | 1% | Carbon Capture +25% CO2, -15% cost |
| Fusion Progress | 0.8% | +2 RP per center |

**Source:** All probabilities and effects are GAME DESIGN, not based on real-world data.

---

## 14. Natural Disasters

| Disaster | Base Prob | Temp Scaling | Income Reduction | Duration | Source |
|----------|-----------|--------------|------------------|----------|--------|
| Heat Wave | 0.5% | 2.5x/°C | 15% | 2-3 mo | IPCC AR6 WG2 |
| Hurricane | 0.4% | 2.0x/°C | 25% | 1-2 mo | IPCC AR6 WG2 |
| Flooding | 0.5% | 1.8x/°C | 20% | 1-2 mo | IPCC AR6 WG2 |
| Drought | 0.3% | 3.0x/°C | 20% | 3-6 mo | IPCC AR6 WG2 |
| Wildfire | 0.3% | 2.8x/°C | 15% | 2-4 mo | IPCC AR6 WG2 |
| Cold Snap | 0.2% | 1.2x/°C | 10% | 1-2 mo | IPCC AR6 WG2 |

**IPCC AR6 Extreme Weather Scaling:**
- Precipitation extremes: **+7% per 1°C** of warming (Clausius-Clapeyron relation)
- 10-year extreme events: **~2x more frequent** at 1.5°C, **~2.7x at 2°C**
- Heat extremes: Most attributable increase, scaling ~4-5x per °C
- Tropical cyclones: Intensity increase ~5% per °C (frequency uncertain)

**Game Scaling Comparison:**
Game uses 1.8-3.0x/°C which is slightly higher than IPCC for gameplay impact. Real-world: most events roughly double in frequency at 2°C warming.

### Regional Vulnerability (0-1 scale)
| Region | Heat | Hurricane | Flood | Drought | Wildfire | Cold | Resilience |
|--------|------|-----------|-------|---------|----------|------|------------|
| Europe | 0.4 | 0.0 | 0.5 | 0.3 | 0.3 | 0.3 | 0.7 |
| Asia | 0.6 | 0.3 | 0.6 | 0.4 | 0.2 | 0.2 | 0.5 |
| North America | 0.5 | 0.4 | 0.5 | 0.4 | 0.5 | 0.4 | 0.7 |
| South America | 0.5 | 0.2 | 0.6 | 0.5 | 0.4 | 0.0 | 0.4 |
| Africa | 0.7 | 0.1 | 0.5 | 0.7 | 0.3 | 0.0 | 0.3 |
| Oceania | 0.7 | 0.3 | 0.4 | 0.7 | 0.8 | 0.0 | 0.6 |
| Middle East | 0.9 | 0.0 | 0.3 | 0.8 | 0.1 | 0.0 | 0.5 |

**Source:** Values are ESTIMATES informed by [ND-GAIN Country Index](https://gain.nd.edu/our-work/country-index/).

**ND-GAIN Vulnerability Index:**
- Ranks 185 countries on climate vulnerability and readiness
- Data available 2004-2023
- Components: Exposure, Sensitivity, Adaptive Capacity
- Africa/South Asia highest vulnerability, Northern Europe lowest
- Game resilience values (0.3-0.7) roughly correspond to ND-GAIN rankings

---

## 15. Diplomatic System

### Alliance Interest Thresholds
| Level | Interest Score |
|-------|----------------|
| Very High | 80+ |
| High | 60-79 |
| Moderate | 40-59 |
| Low | 20-39 |
| Hostile | 0-19 |

### Happiness Thresholds
| State | Score |
|-------|-------|
| Happy | 80+ |
| Content | 60-79 |
| Concerned | 40-59 |
| Unhappy | 20-39 |
| Critical | 0-19 |

### Cooldowns
| Type | Duration |
|------|----------|
| Hostile cooldown | 6 months |
| Negotiation cooldown | 3 months |

### Negotiable Terms
| Term | Min | Max | Default |
|------|-----|-----|---------|
| Carbon Commitment | 0.5% | 3.0% | 1.0% |
| Renewable Target | 20% | 80% | 40% |
| CCS Requirement | 0 | 5 | 0 |
| Carbon Tax Level | 0% | 50% | 10% |

---

## 16. Climate Campaigns

| Parameter | Value |
|-----------|-------|
| Cost Factor | 0.5% of GDP |
| Base Duration | 12 months |
| Min Success Increase | 20% |
| Max Success Increase | 50% |

---

## 17. Achievements

| Achievement | Condition |
|-------------|-----------|
| First Steps | 1 project |
| Getting Started | 10 projects |
| Renewable Revolution | 50 renewable projects |
| Tech Leader | All technologies |
| Carbon Neutral | Net-zero emissions |
| Climate Champion | Temp below +1.1°C |
| Speed Run | Win before 2050 |
| Against All Odds | Win on Extreme |
| Global Coalition | 20+ unique campaign countries |
| Research Pioneer | 500 RP accumulated |
| Forest Guardian | 25 forest projects |
| Nuclear Age | 10 nuclear plants |
| Carbon Capture Master | 15 CCS facilities |
| Big Spender | $1 trillion spent |
| Survivor | 2075 with no tipping points |

---

## 18. Global Emissions Totals (from climate-data.js)

### Target Values vs Real World (GCB 2025)
| Metric | Game Value | Real World 2025 | Status | Source |
|--------|------------|-----------------|--------|--------|
| Fossil CO2 emissions | ~38 Gt/yr | 38.1 Gt/yr | ✅ | GCB 2025 |
| Land-use change emissions | (included) | 4.1 Gt/yr | - | GCB 2025 |
| **Total CO2 emissions** | ~38 Gt/yr | ~42.2 Gt/yr | Close | GCB 2025 |
| Power sector | ~12 Gt/yr | ~14.5 Gt/yr | Close | IEA |
| **Industry** | **~9.4 Gt/yr** | ~9.4 Gt/yr | ✅ FIXED | IEA |
| Transport | ~8.6 Gt/yr | ~8.0 Gt/yr | Close | IEA |
| Buildings | ~4.1 Gt/yr | ~3.0 Gt/yr | Close | IEA |
| Agriculture | ~5.3 Gt/yr | ~5.8 Gt/yr | Close | IPCC |

### Industry Emissions by Region (Updated)
| Region | Game Value | Previous |
|--------|------------|----------|
| Asia | 6.5 Gt/yr | 10.5 |
| North America | 1.2 Gt/yr | 1.5 |
| Europe | 1.0 Gt/yr | 1.2 |
| South America | 0.35 Gt/yr | 0.45 |
| Africa | 0.25 Gt/yr | 0.35 |
| Oceania | 0.10 Gt/yr | 0.18 |
| **Total** | **9.4 Gt/yr** | 14.2 |

**GCB 2025 Key Findings:**
- 2025 fossil emissions: **38.1 Gt CO2** (+1.1% from 2024) - record high
- Land-use change: **4.1 Gt CO2** (down from previous years)
- Ocean sink: **29%** of emissions (~12.2 Gt/yr) - ✅ Game matches
- Land sink: **21%** of emissions (~8.9 Gt/yr) - ✅ Game matches

**Note:** Game values now match GCB 2025 for sinks and IEA for industry emissions.

---

## 19. Power Generation by Major Region (TWh/year)

| Region | Coal | Gas | Nuclear | Hydro | Wind | Solar | Total |
|--------|------|-----|---------|-------|------|-------|-------|
| East Asia | 6000 | 960 | 720 | 1680 | 1080 | 1320 | 12000 |
| South Asia | 1625 | 175 | 75 | 250 | 175 | 175 | 2500 |
| Southeast Asia | 450 | 280 | 0 | 150 | 20 | 70 | 1000 |
| West Asia | 98 | 1050 | 42 | 112 | 56 | 28 | 1400 |
| North America | 770 | 1920 | 865 | 480 | 530 | 290 | 4900 |
| South America | 78 | 232 | 47 | 930 | 155 | 93 | 1550 |
| Western Europe | 60 | 180 | 480 | 120 | 150 | 90 | 1200 |
| Eastern Europe | 326 | 196 | 284 | 152 | 44 | 28 | 1200 |
| Sub-Saharan Africa | 256 | 25 | 18 | 145 | 17 | 42 | 550 |

**Source:** Based on IEA 2023 data, simplified for game regions.

---

## 20. Power Emission Factors

| Fuel | Factor Used | Real-World Range | Unit | Source |
|------|-------------|------------------|------|--------|
| Coal | 1.0 | 0.82-1.1 | kg CO2/kWh | IEA (varies by coal type) |
| Natural Gas | 0.45 | 0.41-0.50 | kg CO2/kWh | IEA (combined cycle) |

**Code location:** `game.js` lines 665-666:
```javascript
const baseCoalEmissions = (currentMix.coal || 0) * 0.001; // 1.0 kg/kWh = 1 Mt/TWh
const baseGasEmissions = (currentMix.gas || 0) * 0.00045; // 0.45 kg/kWh
```

---

## 21. Data Sources Referenced

| Source | URL | Data Types |
|--------|-----|------------|
| Global Carbon Project | globalcarbonproject.org | Annual CO2 budget, sinks |
| IEA | iea.org/data-and-statistics | Energy, emissions by country |
| Our World in Data | ourworldindata.org/co2-emissions | Historical, per capita |
| Climate Watch | climatewatchdata.org | NDCs, sectoral data |
| IPCC AR6 | ipcc.ch | Climate projections, thresholds |
| World Bank | worldbank.org | GDP, population |
| IRENA | irena.org | Renewable capacity, costs |
| Global Solar Atlas | globalsolaratlas.info | Solar potential |

---

## 22. Key Data Gaps (Priority List)

### ✅ VERIFIED (January 2026)
1. [x] **Total CO2 emissions** - 42.2 Gt/yr (GCB 2025)
2. [x] **Natural carbon sinks** - Ocean 29%, Land 21% (GCB 2025)
3. [x] **Tipping point thresholds** - Verified against IPCC AR6
4. [x] **Renewable project costs** - Verified against IRENA 2024
5. [x] **Current warming** - ~1.2°C (IPCC/NOAA)
6. [x] **Remaining carbon budgets** - 1.5°C (~4yr), 1.7°C (525 Gt), 2°C (1055 Gt)
7. [x] **GDP growth rates by development** - World Bank GEP Jan 2025
8. [x] **Energy efficiency improvement rates** - IEA 2024 (1-4%/yr depending on region)
9. [x] **Lifecycle emissions for clean tech** - IPCC/NREL (4-43 gCO2/kWh)
10. [x] **GDP-climate damage function** - Nordhaus DICE (2.1% at 3°C), IMF studies
11. [x] **Disaster probability scaling** - IPCC AR6 WG2 (~2x at 2°C)
12. [x] **Regional vulnerability methodology** - ND-GAIN Index

### High Priority - Still Need Better Sources
1. [ ] All sector growth rates (industry, transport, buildings, agriculture) - need IEA sectoral data
2. [ ] Natural sink saturation parameters (specific ppm/temperature thresholds) - need carbon cycle papers
3. [ ] Power plant construction costs by technology - need Lazard/IEA capital cost data

### Medium Priority - GAME DESIGN (Document Rationale Only)
4. [ ] Tipping point effect magnitudes (ppm/month) - intentionally scaled for gameplay
5. [ ] Feedback loop effect magnitudes - intentionally scaled for gameplay
6. [ ] Event probabilities and durations - tuned for engagement
7. [ ] Research center costs and RP generation - balanced for progression

### Low Priority - Pure Game Mechanics (No Real-World Equivalent)
8. [ ] Happiness impact values - GAME DESIGN
9. [ ] Alliance negotiation terms - GAME DESIGN
10. [ ] Achievement thresholds - GAME DESIGN
11. [ ] Difficulty mode multipliers - GAME DESIGN

---

## 23. Code File Locations

| Data | File | Lines |
|------|------|-------|
| GAME_CONFIG | `public/game.js` | 1-30 |
| GROWTH_CONFIG | `public/game.js` | 33-55 |
| SECTOR_GROWTH_RATES | `public/game.js` | 62-67 |
| DEVELOPMENT_GROWTH_MODIFIERS | `public/game.js` | 70-95 |
| EFFICIENCY_IMPROVEMENT | `public/game.js` | 98-103 |
| NATURAL_SINK_CONFIG | `public/game.js` | 106-118 |
| EMBODIED_CARBON | `public/game.js` | 121-129 |
| TIPPING_POINTS | `public/game.js` | 958-1005 |
| FEEDBACK_LOOPS | `public/game.js` | 1008-1030 |
| POWER_CONFIG | `public/game.js` | 1156-1200 |
| CAPACITY_FACTORS | `public/game.js` | 1210-1226 |
| TECHNOLOGIES | `public/game.js` | 1703-1774 |
| RESEARCH_CENTERS | `public/game.js` | 1781-1892 |
| EVENTS | `public/game.js` | 1895-2087 |
| NATURAL_DISASTERS | `public/game.js` | 2090-2180 |
| DEFAULT_VULNERABILITY | `public/game.js` | 2205-2227 |
| ACHIEVEMENTS | `public/game.js` | 2510-2683 |
| DIFFICULTY_MODES | `public/game.js` | 3676-3721 |
| PROJECT_TYPES | `public/game.js` | 3830-4109 |
| MAJOR_REGIONS | `public/climate-data.js` | 296-724 |
| COUNTRY_DATA | `public/climate-data.js` | 780-3296 |
| REGION_AGGREGATES | `public/climate-data.js` | 3297-3790 |

---

## 24. Game Design Rationale

This section documents why certain game values intentionally differ from real-world data.

### Why Game Values Differ from Real-World

| Parameter | Real-World | Game Value | Rationale |
|-----------|------------|------------|-----------|
| GDP damage rate | 1-3%/°C | 10%/°C | Makes climate impact more visible within game timeframe |
| Project costs | $0.7-4B/GW | $15-75B | Gives sense of major infrastructure investment, balances economy |
| EMISSIONS_TO_PPM | 0.21 | 0.128 | Tuned for gameplay pacing (slower than real world) |
| Tipping point effects | Complex | +0.08-0.18 ppm/mo | Simplified to additive CO2 for clarity |
| Disaster scaling | ~2x at 2°C | 1.8-3.0x/°C | Slightly amplified for gameplay engagement |

### Game Design Principles

1. **Visibility**: Climate effects need to be noticeable within a 75-year game span
2. **Agency**: Players need meaningful choices that visibly impact outcomes
3. **Balance**: Economy, research, and construction must all matter
4. **Education**: Core relationships (more CO2 → more warming → more disasters) should be accurate
5. **Engagement**: Events and disasters should happen often enough to feel meaningful

### What IS Accurate

- **Relative rankings**: Solar cheaper than nuclear, developing countries grow faster
- **Direction of effects**: All feedback loops and relationships work in correct direction
- **Thresholds**: Tipping points at roughly correct temperature levels
- **Sector contributions**: Power, industry, transport, buildings in correct proportions

### What is Simplified

- **Timing**: Real climate change is slower; game compresses timescales
- **Complexity**: Real carbon cycle has many more feedbacks; game uses key ones
- **Regional detail**: 185 countries grouped into ~30 major regions
- **Technology learning curves**: Real costs decline faster; game uses fixed costs

---

*Last updated: January 16, 2026*
*Sources verified via Chrome MCP browser research*
