# Carbon Capture Game - Demo Script

A comprehensive guide for demonstrating the Carbon Capture climate strategy game. This demo covers all major features and mechanics in approximately 22 minutes.

---

## Pre-Demo Setup

Before starting the demo:
1. Open a browser and navigate to the game
2. Clear any existing saved games (optional, for a fresh start)
3. Ensure the browser window is large enough to show the full interface

---

## Section 1: Launch & Introduction (~2 min)

### What to Show
- The game launch screen with title "Carbon Capture: Climate Overseer" and difficulty selector

### What to Explain

**Opening:**
> "Welcome to Carbon Capture: Climate Overseer, a climate strategy game where you play as a global climate organization tasked with preventing catastrophic climate change."

**The Goal:**
> "Your mission is to reduce global temperature from the current +1.09°C anomaly down to +1.0°C or below by the year 2100. You'll do this by forming international alliances, funding climate projects, and developing new technologies."

**Difficulty Modes:**
Point out the 5 difficulty options and explain each:
- **Tutorial**: Generous budget, slow warming, helpful hints
- **Easy**: Relaxed gameplay experience
- **Normal**: Balanced challenge
- **Hard**: Minimal budget, aggressive warming
- **Extreme**: Near-impossible conditions for expert players

### Action
- Select **Tutorial** mode
- Click "New Game"

**After Game Loads:**
Point out the initial state in the header:
- **Budget**: Your available funds (starts at $50B in Tutorial)
- **Date**: January 2025 - you have 75 years
- **CO2**: Current atmospheric concentration (~420 ppm)
- **Temperature**: Current global anomaly (+1.09°C)

---

## Section 2: World Map & Navigation (~3 min)

### What to Show
- The World tab (default view)
- Map visualization controls
- Region selection

### What to Explain

**Main Interface Tabs:**
> "The game has three main tabs at the top: World, Region, and Tech. World shows the global map and climate status. Region shows details about the selected area. Tech shows the technology research tree."

**Map Granularity:**
Point to the granularity selector (Continents | Regions | Countries):
> "During initial setup, you can view the map at different levels of detail. Continents gives you 6 major regions. Regions breaks these into sub-regions. Countries shows individual nations."

Note: The granularity selector is only available during the initial game setup phase, not during regular gameplay.

### Action
- Click through each granularity option to demonstrate (during setup)

**Visualization Modes:**
Point to the visualization mode selector:
> "These modes color-code the map by different metrics."

### Action
Cycle through key modes and explain:
1. **Alliance**: Shows allied (green) vs non-allied (gray) regions
2. **Emissions**: Shows CO2 emissions (darker = more emissions)
3. **Renewables**: Shows renewable energy adoption (green = more renewables)
4. **Economy**: Shows GDP and economic output

**Region Selection:**
> "Click any region to select it and see detailed information."

### Action
- Click on **North America** on the map
- Point out that it highlights and shows in the Region panel

**Alliance Legend:**
Point to the map legend:
> "Green regions are your allies - you can build projects there. Gray regions are not allied yet - you'll need to negotiate with them first. North America starts as your only ally (your home region)."

---

## Section 3: Alliance System (~3 min)

### What to Show
- Non-allied region state
- Negotiation popup
- Alliance terms

### What to Explain

**Why Alliances Matter:**
> "To take climate action in a region, you need them in your alliance. Without an alliance, you can't build projects or receive funding from that region. Currently, only North America is allied with us as our home region."

### Action
- Click on **Europe** (or another non-allied region)

**Region Interest:**
Point to the Alliance Interest indicator:
> "Each region has an 'Alliance Interest' percentage. This shows how likely they are to join your alliance. Higher interest means better negotiation odds."

### Action
- Click the "Negotiate Alliance" button

**Negotiation Popup:**
> "This is the negotiation screen. At the top you see the success probability - this is your chance of the region accepting."

Point out the alliance terms sliders:
1. **Min/Max Climate Dedication**: The range of GDP percentage the region commits to climate action
2. **Power Stability Goal**: Target grid stability percentage
3. **Power Supply Goal**: Target power supply sufficiency
4. **Goal Deadline**: Years to achieve the targets
5. **Carbon Tax Rate**: The carbon tax they must implement
6. **Carbon Tax Growth**: Annual increase in carbon tax

> "You can adjust these terms. Lower targets make the deal more attractive (higher success chance), but mean less climate action. Higher targets are harder to negotiate but create more impact."

### Action
- Move a slider up and show the probability decreasing
- Move it back down and show probability increasing

> "Notice how demanding stricter terms reduces your success probability. This is the core tradeoff - ambitious terms vs. likelihood of success."

**Negotiate or Cancel:**
> "Once you're happy with the terms, click Negotiate. If successful, the region joins your alliance!"

### Action
- Set reasonable terms and click "Negotiate"
- Show the result (success or failure)

If successful:
> "Great! This region is now allied. We can build projects here and receive funding based on their GDP and climate dedication."

If failed:
> "The negotiation failed. The region becomes temporarily hostile and won't negotiate again for several months."

---

## Section 4: Region Management & Projects (~4 min)

### What to Show
- Region panel details
- Climate Finance section
- Power Grid section
- Emissions section
- Available projects

### What to Explain

### Action
- Click on **North America** to select an allied region
- Click the **Region** tab to see full details

**Climate Finance Section:**
> "This shows the region's economic contribution to your climate efforts."

Point out:
- **GDP**: The region's economic output
- **Climate Dedication**: What percentage of GDP goes to climate action (click for tooltip explaining this)
- **Monthly Income**: How much funding you receive each month from this ally

> "Climate Dedication is crucial. Higher dedication means more funding. You can increase it through campaigns."

### Action
- Point to the "Climate Policy Campaign" button
- Explain: "Running a campaign costs money but can boost a region's climate dedication, increasing your income."

**Power Grid Section:**
> "This shows the region's electricity infrastructure."

Point out:
- **Demand vs Supply**: Whether they have enough power
- **Grid Stability**: How reliable their power grid is
- **Generation Mix**: The breakdown by source (coal, gas, nuclear, renewables)

> "Transitioning regions away from fossil fuels (coal, gas) to renewables is a key strategy."

**Emissions by Sector:**
> "This breaks down where the region's CO2 emissions come from."

Point out the five sectors:
- **Power Generation**: Electricity production from fossil fuels
- **Industry**: Manufacturing, mining, construction
- **Transport**: Cars, trucks, planes, ships
- **Buildings**: Heating, cooling, electricity use
- **Agriculture**: Farming, livestock, land use

> "Different projects target different sectors. Understanding where emissions come from helps you choose effective projects."

**Project Effectiveness:**
> "This shows how effective different project types are in this region."

Point out the star ratings:
> "More stars means the project will have more impact here. For example, solar farms are more effective in sunny regions, wind farms in windy areas."

**Available Projects:**
Scroll to the projects section:
> "These are the projects you can build in this region. Each shows its cost, build time, and effectiveness."

Point out:
- **Cost**: Budget required to start construction
- **Duration**: Months until completion
- **Effectiveness Badge**: Regional multiplier (look for ★ ratings)

> "Projects are organized into three tabs:"
- **Climate**: Carbon capture, reforestation, and emission reduction projects
- **Power**: Energy generation including renewables, nuclear, and grid infrastructure
- **Economic**: Research centers and economic development projects

### Action
- Click on a **Research Center** project
- Click "Build Project"

> "The project is now under construction. It will complete in the shown number of months."

Point to the "Under Construction" section:
> "Active construction projects appear here. Once complete, they start providing benefits."

---

## Section 5: Technology Tree (~3 min)

### What to Show
- Tech tab interface
- Technology tiers
- Locked vs unlocked technologies
- Research points

### What to Explain

### Action
- Click the **Tech** tab

**Research Points:**
Point to the Research Points indicator:
> "Research Points (RP) are earned from Research Centers. You spend RP to unlock new technologies."

**Tech Tree Structure:**
> "Technologies are organized in tiers. START tier is available from the beginning. Higher tiers require unlocking with RP."

Point out the visual elements:
- **Gold border**: Available to research now
- **Lock icon (🔒)**: Requires prerequisites or higher tier
- **Dashed/faded**: Not yet accessible

**Prerequisites:**
> "Some technologies require others first. For example, Advanced Solar might require Basic Solar. The lines show these dependencies."

**Technology Benefits:**
Click on a technology to show its details:
> "Each technology provides benefits when unlocked:"
- **New Projects**: Unlocks new project types to build
- **Cost Reductions**: Makes certain projects cheaper
- **Effectiveness Bonuses**: Increases project impact

### Action
- Click on an available technology
- Show the unlock button and RP cost
- Optionally unlock if you have enough RP

> "Researching technologies is a key part of your strategy. Early game, focus on Research Centers to build RP income. Then unlock technologies that support your overall plan."

---

## Section 6: Climate Systems & Tipping Points (~3 min)

### What to Show
- Global Status panel
- Tipping Points section
- Climate History graph

### What to Explain

### Action
- Click back to the **World** tab
- Make sure the left panel (Global Status) is visible

**Global Status:**
> "This panel shows the current state of Earth's climate."

Explain each metric:
- **Temperature**: Current global temperature anomaly above pre-industrial levels
- **CO2**: Atmospheric CO2 concentration in parts per million (ppm)
- **Net CO2/mo**: Monthly change in emissions minus absorption
  - Green/negative = good (absorbing more than emitting)
  - Red/positive = bad (still adding to atmosphere)
- **Feedback**: Climate feedback effects (permafrost methane, etc.)

**Tipping Points:**
Scroll to the Tipping Points section:
> "Tipping points are critical temperature thresholds. If crossed, they trigger irreversible changes that accelerate warming."

Explain each tipping point:
1. **+1.4°C - Arctic Sea Ice Decline**: Ice reflects sunlight. Without it, oceans absorb more heat.
2. **+1.7°C - Permafrost Methane Release**: Frozen ground releases trapped methane (powerful greenhouse gas).
3. **+2.1°C - Amazon Rainforest Dieback**: Rainforest dies and releases stored carbon.
4. **+2.4°C - Ocean Circulation Weakening**: Ocean currents that regulate climate slow or stop.

> "Once triggered, these cannot be undone. Avoiding tipping points is crucial - they create runaway warming that makes your job much harder."

**Climate History Graph:**
Point to the graph section:
> "This graph tracks climate metrics over time."

Click through the tabs:
- **CO2**: Atmospheric concentration history
- **Temperature**: Global temperature anomaly over time
- **Budget**: Your funding level over time

> "Use this to track your progress. You want CO2 and temperature trending downward."

---

## Section 7: Events & Disasters (~2 min)

### What to Show
- Explain the event system
- Global Briefing panel
- Active Disasters section

### What to Explain

**Random Events:**
> "Throughout the game, random events occur that affect gameplay. These simulate real-world uncertainty."

Explain event categories:

**Climate Events:**
> "Heat waves, hurricanes, floods, droughts, volcanic eruptions. These affect regional income and can cause damage. However, they also increase public awareness, making climate campaigns more effective."

**Political Events:**
> "International summits, policy changes, elections. These can boost or reduce regional climate dedication."

**Economic Events:**
> "Recessions reduce funding. Green investment booms increase it."

**Technology Breakthroughs:**
> "Random discoveries that provide permanent bonuses - cost reductions, efficiency improvements. These are always beneficial."

**Global Briefing:**
Point to the Global Briefing panel on the right:
> "Recent events and game updates appear here as news items. Read them to understand what's happening and how it affects your strategy."

**Active Disasters:**
Point to the Active Disasters section:
> "When disasters strike, they appear here showing the affected region, impact (like income reduction), and duration remaining."

### Action
- If any events have occurred, read through them
- Otherwise, advance a few months to trigger some events

---

## Section 8: Win/Lose Conditions & Strategy (~2 min)

### What to Show
- Win/lose conditions
- Key strategies
- Game controls

### What to Explain

**Win Condition:**
> "You win by reducing global temperature to +1.0°C or below. This requires massive investment in clean energy, carbon capture, and reforestation."

**Lose Conditions:**
> "You lose if temperature reaches +2.0°C (catastrophic warming) or if you reach year 2100 without achieving the goal."

**Key Strategy Tips:**

1. **Early Research:**
> "Build Research Centers early. They generate Research Points needed to unlock better technologies."

2. **Climate Campaigns:**
> "Run campaigns in high-GDP regions to boost their climate dedication. More dedication = more income."

3. **Regional Effectiveness:**
> "Build projects where they're most effective. Solar in sunny regions, wind in windy areas. Check the star ratings."

4. **Watch Tipping Points:**
> "Keep temperature below tipping points. Each one you trigger makes winning harder."

5. **Balanced Portfolio:**
> "Don't rely on just renewables or just CCS. Use a mix: clean energy, carbon capture, and nature-based solutions."

6. **Expand Alliances:**
> "More allies = more income and more places to build projects. Negotiate wisely."

**Game Controls:**

### Action
- Point to the "Next Month" button:
> "Click this to advance time. One month passes, income arrives, construction progresses, and climate changes."

- Point to the control buttons in the top bar:
  - **Restart Game**: Start a new game from the beginning
  - **Exit**: Return to the main menu
  - **?**: Access help and game information

**Achievements:**
Point to the Achievements section in the right panel:
> "The game tracks achievements (shown as X/15) for completing various challenges. These add replayability and goals beyond just winning."

---

## Demo Conclusion

**Wrap Up:**
> "That covers the main features of Carbon Capture: Climate Overseer. The game combines strategy elements - resource management, diplomacy, technology development - with real climate science. The data comes from sources like the Global Carbon Budget and IEA."

**Invite Questions:**
> "Would you like to see anything in more detail, or do you have questions about how any system works?"

---

## Quick Reference: Key UI Elements

| Element | Location | Purpose |
|---------|----------|---------|
| Budget | Header | Current funds available |
| Date | Header | Current game date |
| CO2 | Header | Atmospheric CO2 (ppm) |
| Temperature | Header | Global temp anomaly |
| World/Region/Tech | Tabs | Main navigation |
| Granularity | Setup phase | Map detail level (setup only) |
| Visualization | Below tabs | Map coloring mode |
| Global Status | Left panel | Climate metrics |
| Tipping Points | Left panel | Temperature thresholds |
| Climate History | Left panel | Graph of metrics |
| Region Details | Right panel | Selected region info |
| Projects | Region panel | Available construction |
| Global Briefing | Right panel | Recent events |
| Active Disasters | Right panel | Current disaster effects |
| Next Month | Top center | Advance time |
| Restart Game | Top center | Start new game |
| Exit | Top center | Return to main menu |

---

## Troubleshooting

**If the map doesn't load:**
- Refresh the browser
- Check the console for errors

**If a region won't select:**
- Make sure you're clicking on the colored region, not empty space
- Try a different granularity level

**If negotiations always fail:**
- Lower your term requirements
- Wait for region interest to increase
- Check if region is hostile (cooldown after failed negotiation)

---

*Demo script created: January 2026*
