# Data Sources

## Priority Sources

When verifying or updating data, check these sources first (in order of priority):

1. **IEA World Energy Outlook 2025**
   https://iea.blob.core.windows.net/assets/dfe5daf4-dbc1-4533-abeb-fafb1faee0f9/WorldEnergyOutlook2025.pdf

---

## Climate Science Data

Core climate parameters used in game mechanics (`public/game.js`).

| Value | Description | Source |
|-------|-------------|--------|
| 420 ppm | Starting atmospheric CO2 (2025) | [SOURCE NEEDED] |
| 280 ppm | Pre-industrial CO2 baseline | [SOURCE NEEDED] |
| 1.2°C | Current warming above pre-industrial | [SOURCE NEEDED] |
| 0.008°C/ppm | Temperature sensitivity per ppm CO2 | [SOURCE NEEDED] |
| 0.75 ppm/month | Base CO2 increase rate (before mitigation) | [SOURCE NEEDED] |
| 1.0°C | Win condition (target temperature) | [SOURCE NEEDED] |
| 3.0°C | Lose condition (catastrophic warming) | [SOURCE NEEDED] |

---

## Tipping Points

Climate tipping point thresholds and their effects (`public/game.js`).

| Tipping Point | Threshold | CO2 Effect | Description | Source |
|---------------|-----------|------------|-------------|--------|
| Arctic Ice Decline / Permafrost | 1.4°C | +0.08 ppm/month | Reduced Earth reflectivity, permafrost thaw | [SOURCE NEEDED] |
| Permafrost Methane Release | 1.7°C | +0.15 ppm/month | Methane release from thawing permafrost | [SOURCE NEEDED] |
| Amazon Dieback | 2.1°C | +0.12 ppm/month | Rainforest becomes savanna, 50% forest effectiveness reduction | [SOURCE NEEDED] |
| Atlantic Circulation Collapse | 2.4°C | +0.18 ppm/month | AMOC weakens, 30% less ocean CO2 absorption | [SOURCE NEEDED] |

---

## Feedback Loops

Climate feedback mechanisms (`public/game.js`).

| Feedback | Start Threshold | Max Threshold | Max Effect | Source |
|----------|-----------------|---------------|------------|--------|
| Ice-Albedo | 1.5°C | 3.0°C | +0.05 ppm/month | [SOURCE NEEDED] |
| Ocean Saturation | 450 ppm | 550 ppm | +0.08 ppm/month | [SOURCE NEEDED] |
| Vegetation Stress | 2.0°C | 3.0°C | +0.04 ppm/month | [SOURCE NEEDED] |

---

## Energy Capacity Factors

Annual capacity factors for power generation technologies (`public/game.js`).

| Technology | Capacity Factor | Hours/Year | Source |
|------------|-----------------|------------|--------|
| Solar PV | 20% | ~1,752 | [SOURCE NEEDED] |
| Wind (Onshore) | 30% | ~2,628 | [SOURCE NEEDED] |
| Offshore Wind | 40% | ~3,504 | [SOURCE NEEDED] |
| Nuclear | 90% | ~7,884 | [SOURCE NEEDED] |
| Coal | 50% | ~4,380 | [SOURCE NEEDED] |
| Natural Gas | 45% | ~3,942 | [SOURCE NEEDED] |
| Geothermal | 80% | ~7,008 | [SOURCE NEEDED] |
| Hydropower | 40% | ~3,504 | [SOURCE NEEDED] |
| Battery Storage | 15% | ~1,314 | [SOURCE NEEDED] |
| Pumped Hydro | 25% | ~2,190 | [SOURCE NEEDED] |

---

## Project Costs and Stats

Project costs and specifications (`public/game.js`).

### Variable Power (Intermittent)

| Project | Cost | Capacity | CO2 Reduction | Grid Stability | Source |
|---------|------|----------|---------------|----------------|--------|
| Solar Farm | $15B | 0.5 GW | 1 unit | -5 | [SOURCE NEEDED] |
| Wind Farm | $18B | 0.3 GW | 1 unit | -4 | [SOURCE NEEDED] |
| Offshore Wind | $45B | 0.8 GW | 2 units | -3 | [SOURCE NEEDED] |

### Baseload Power (Stable)

| Project | Cost | Capacity | CO2 Reduction | Grid Stability | Source |
|---------|------|----------|---------------|----------------|--------|
| Nuclear Plant | $75B | 1.2 GW | 3 units | +15 | [SOURCE NEEDED] |
| Coal Plant | $8B | 1.0 GW | -3 units | +10 | [SOURCE NEEDED] |
| Natural Gas | $12B | 0.8 GW | -1.5 units | +8 | [SOURCE NEEDED] |
| Geothermal | $35B | 0.3 GW | 1 unit | +8 | [SOURCE NEEDED] |
| Hydropower Dam | $50B | 0.5 GW | 1.5 units | +12 | [SOURCE NEEDED] |

### Energy Storage

| Project | Cost | Power | Storage | Stability | Source |
|---------|------|-------|---------|-----------|--------|
| Battery Storage | $20B | 0.2 GW | 0.8 GWh (4h) | +15 | [SOURCE NEEDED] |
| Pumped Hydro | $40B | 0.5 GW | 6.0 GWh (12h) | +20 | [SOURCE NEEDED] |

### Climate Projects

| Project | Cost | CO2 Reduction | Source |
|---------|------|---------------|--------|
| Reforestation | $7.5B | 2 units | [SOURCE NEEDED] |
| Carbon Capture | $52.5B | 4 units | [SOURCE NEEDED] |
| Research Center | $22.5B | 0 units | [SOURCE NEEDED] |

### Economic Projects

| Project | Cost | GDP Boost | Happiness | Source |
|---------|------|-----------|-----------|--------|
| Green Manufacturing | $30B | +2% | +10 | [SOURCE NEEDED] |
| Public Transit | $22.5B | +1% | +15 | [SOURCE NEEDED] |
| Sustainable Agriculture | $37.5B | +1% | +20 | [SOURCE NEEDED] |
| Trade Agreement | $15B | +3% | +5 | [SOURCE NEEDED] |
| Education Initiative | $18B | +2% | +8 | [SOURCE NEEDED] |

---

## Country Data

Data for 190+ countries stored in `public/climate-data.js`.

### Data Types with Example Values (China)

| Data Type | Example Value | Source |
|-----------|---------------|--------|
| Population | 1,412 million | [SOURCE NEEDED] |
| GDP | $19.23 trillion | [SOURCE NEEDED] |
| Total Emissions | 11.9 Gt CO2/year | [SOURCE NEEDED] |
| Per Capita Emissions | 10.8 t CO2/person/year | [SOURCE NEEDED] |
| Emission Trend | +0.8%/year | [SOURCE NEEDED] |
| Renewable Share | 35% | [SOURCE NEEDED] |
| Coal Share | 58% | [SOURCE NEEDED] |
| Gas Share | 4% | [SOURCE NEEDED] |
| Nuclear Share | 5% | [SOURCE NEEDED] |
| Carbon Price | $8/tonne | [SOURCE NEEDED] |
| Net Zero Target | 2060 | [SOURCE NEEDED] |
| Paris Commitment | -65% | [SOURCE NEEDED] |

### Top Emitters Data

| Country | Total Emissions | Per Capita | Source |
|---------|-----------------|------------|--------|
| China | 11.9 Gt/year | 10.8 t/person | [SOURCE NEEDED] |
| United States | 5.2 Gt/year | 15.0 t/person | [SOURCE NEEDED] |
| India | 2.9 Gt/year | 2.0 t/person | [SOURCE NEEDED] |
| Russia | 1.9 Gt/year | 13.1 t/person | [SOURCE NEEDED] |
| Japan | 1.1 Gt/year | 8.7 t/person | [SOURCE NEEDED] |

### Per Capita Extremes

| Country | Per Capita Emissions | Source |
|---------|---------------------|--------|
| Qatar (highest) | 35.6 t/person | [SOURCE NEEDED] |
| Ethiopia (lowest) | 0.2 t/person | [SOURCE NEEDED] |

---

## Regional Power Data

Power generation data for 15 major regions (`public/climate-data.js`).

### Base Demand and Growth

| Region | Base Demand (GW) | Growth Rate | Source |
|--------|------------------|-------------|--------|
| North Africa | 45 GW | 4%/year | [SOURCE NEEDED] |
| Sub-Saharan Africa | 65 GW | 6%/year | [SOURCE NEEDED] |
| West Asia | 180 GW | 3.5%/year | [SOURCE NEEDED] |
| Central Asia | 35 GW | 3%/year | [SOURCE NEEDED] |
| East Asia & Pacific | 1,600 GW | 4%/year | [SOURCE NEEDED] |

### Generation Mix Example (East Asia)

| Source | Generation (TWh) | Share | Source |
|--------|-----------------|-------|--------|
| Coal | 6,000 | 50% | [SOURCE NEEDED] |
| Gas | 960 | 8% | [SOURCE NEEDED] |
| Nuclear | 720 | 6% | [SOURCE NEEDED] |
| Hydro | 1,680 | 14% | [SOURCE NEEDED] |
| Wind | 1,080 | 9% | [SOURCE NEEDED] |
| Solar | 1,320 | 11% | [SOURCE NEEDED] |

### Renewable Potential Example (Sub-Saharan Africa)

| Technology | Potential (GW) | Source |
|------------|----------------|--------|
| Solar | 1,000 | [SOURCE NEEDED] |
| Wind | 400 | [SOURCE NEEDED] |
| Hydro | 350 | [SOURCE NEEDED] |
| Geothermal | 80 | [SOURCE NEEDED] |

---

## Disaster Events

Natural disaster probabilities and impacts (`public/game.js`).

### Base Probabilities

| Disaster | Base Probability | Temp Scaling | Income Reduction | Duration | Source |
|----------|------------------|--------------|------------------|----------|--------|
| Heat Wave | 0.5%/month | 2.5x | 15% | 2-3 months | [SOURCE NEEDED] |
| Hurricane | 0.4%/month | 2.0x | 25% | 1-2 months | [SOURCE NEEDED] |
| Flooding | 0.5%/month | 1.8x | 20% | 1-2 months | [SOURCE NEEDED] |
| Drought | 0.3%/month | 3.0x | 20% | 3-6 months | [SOURCE NEEDED] |
| Wildfire | 0.3%/month | 2.8x | 15% | 2-4 months | [SOURCE NEEDED] |
| Extreme Cold | 0.2%/month | 1.2x | 10% | 1-2 months | [SOURCE NEEDED] |

---

## Regional Vulnerability Scores

Regional vulnerability to different disasters (`public/game.js`).

| Region | Heat Wave | Hurricane | Flooding | Drought | Wildfire | Extreme Cold | Resilience |
|--------|-----------|-----------|----------|---------|----------|--------------|------------|
| Australia | 0.4 | 0.0 | 0.5 | 0.3 | 0.3 | 0.3 | 0.7 |
| Africa | 0.6 | 0.3 | 0.6 | 0.4 | 0.2 | 0.2 | 0.5 |
| South America | 0.5 | 0.4 | 0.5 | 0.4 | 0.5 | 0.4 | 0.7 |
| Southeast Asia | 0.5 | 0.2 | 0.6 | 0.5 | 0.4 | 0.0 | 0.4 |
| Middle East | 0.7 | 0.1 | 0.5 | 0.7 | 0.3 | 0.0 | 0.3 |
| Sub-Saharan Africa | 0.7 | 0.3 | 0.4 | 0.7 | 0.8 | 0.0 | 0.6 |
| Pacific Islands | 0.9 | 0.0 | 0.3 | 0.8 | 0.1 | 0.0 | 0.5 |

Source: [SOURCE NEEDED]

---

## Research Technology Costs

Research point costs for technology unlocks (`public/game.js`).

| Technology | Cost (RP) | Duration | Bonus | Source |
|------------|-----------|----------|-------|--------|
| Advanced Photovoltaics | 100 | 3 months | 1.2x CO2 reduction, 1.15x income | [SOURCE NEEDED] |
| Turbine Optimization | 250 | 2 months | 0.8x cost, 1.15x CO2 reduction | [SOURCE NEEDED] |
| Bioengineered Trees | 200 | 4 months | 1.3x CO2 reduction | [SOURCE NEEDED] |
| Small Modular Reactors | 500 | 2 months | 0.75x cost, 1.2x income | [SOURCE NEEDED] |
| Direct Air Capture | 1,000 | 6 months | 2.0x CO2 reduction | [SOURCE NEEDED] |
| Green Hydrogen | 750 | 8 months | Grid optimization bonuses | [SOURCE NEEDED] |

Research points per center: 5 RP/month — Source: [SOURCE NEEDED]

---

## Grid Stability Thresholds

Power grid stability parameters (`public/game.js`).

| Parameter | Value | Source |
|-----------|-------|--------|
| Critical stability (blackout risk) | 30 | [SOURCE NEEDED] |
| Warning level | 50 | [SOURCE NEEDED] |
| Good level | 70 | [SOURCE NEEDED] |
| Excellent level | 90 | [SOURCE NEEDED] |
| Variable generation threshold | 30% | [SOURCE NEEDED] |
| Storage mitigation factor | 15 points/ratio | [SOURCE NEEDED] |
| Max storage mitigation | 30 points | [SOURCE NEEDED] |

---

## Energy Pricing

Electricity price thresholds (`public/game.js`).

| Category | Price ($/kWh) | Effect | Source |
|----------|---------------|--------|--------|
| Cheap | $0.08 | Happiness bonus | [SOURCE NEEDED] |
| Normal | $0.12 | Baseline | [SOURCE NEEDED] |
| Expensive | $0.20 | Happiness penalty starts | [SOURCE NEEDED] |
| Crisis | $0.30 | Major GDP impact | [SOURCE NEEDED] |

---

## Notes

- All monetary values are in billions USD unless otherwise specified
- Emissions are measured in Gt CO2 (gigatonnes) for totals, t CO2 (tonnes) for per capita
- Capacity factors represent typical annual averages
- Country data is simplified/rounded for educational purposes
- Data primarily from 2022-2024 reports (see `public/climate-data.js` header)
