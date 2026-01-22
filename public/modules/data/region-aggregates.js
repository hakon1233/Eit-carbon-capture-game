/**
 * Region aggregates for continent-level data
 * Contains curated data for the 6 continental regions
 */

export const REGION_AGGREGATES = {
  north_america: {
    name: "North America",
    developmentLevel: "developed",
    countries: ["usa", "canada", "mexico"],
    gdp: 28.9,
    baseIncome: 15,
    sectorIncome: {
      electricity: 3,
      transport: 4,
      industry: 5,
      buildings: 2,
      agriculture: 1,
    },
    avgPotential: {
      solar: 0.75,
      wind: 0.85,
      forest: 0.70,
      carbonCapture: 0.75,
    },
    diplomatic: {
      joinDifficulty: 4,
      baseDemands: ["carbonTaxLimit", "economicProjects"],
      personality: "demanding",
      description: "Wealthy and influential, but demands economic benefits",
    },
    power: {
      baseDemandGW: 550,
      demandGrowthRate: 0.018,
      currentMixTWh: {
        coal: 770,
        gas: 1920,
        nuclear: 865,
        hydro: 480,
        wind: 530,
        solar: 290,
        other: 45,
      },
      potentialGW: {
        solar: 3000,
        wind: 2000,
        hydro: 200,
        geothermal: 50,
        nuclear: 150,
      },
    },
    sectorEmissions: {
      industry: {
        baseline: 1.2,
        subsectors: {
          cement: 0.10,
          steel: 0.20,
          chemicals: 0.36,
          other: 0.54,
        },
      },
      transport: {
        baseline: 2.2,
        subsectors: {
          road: 1.65,
          aviation: 0.35,
          shipping: 0.15,
          rail: 0.05,
        },
      },
      buildings: {
        baseline: 0.8,
        subsectors: {
          residential: 0.50,
          commercial: 0.30,
        },
      },
      agriculture: {
        baseline: 1.0,
        subsectors: {
          livestock: 0.50,
          crops: 0.35,
          landUse: 0.15,
        },
      },
    },
  },
  south_america: {
    name: "South America",
    developmentLevel: "emerging",
    countries: ["brazil", "argentina"],
    gdp: 2.5,
    baseIncome: 4,
    sectorIncome: {
      electricity: 0.5,
      transport: 1,
      industry: 0.5,
      buildings: 0.5,
      agriculture: 1.5,
    },
    avgPotential: {
      solar: 0.80,
      wind: 0.80,
      forest: 0.90,
      carbonCapture: 0.45,
    },
    diplomatic: {
      joinDifficulty: 5,
      baseDemands: ["localSpending", "jobPriority"],
      personality: "cooperative",
      description: "Values environmental protection, needs local investment",
    },
    power: {
      baseDemandGW: 190,
      demandGrowthRate: 0.03,
      currentMixTWh: {
        coal: 78,
        gas: 232,
        nuclear: 47,
        hydro: 930,
        wind: 155,
        solar: 93,
        other: 15,
      },
      potentialGW: {
        solar: 1500,
        wind: 1200,
        hydro: 300,
        geothermal: 80,
        nuclear: 40,
      },
    },
    sectorEmissions: {
      industry: {
        baseline: 0.35,
        subsectors: {
          cement: 0.06,
          steel: 0.09,
          chemicals: 0.08,
          other: 0.12,
        },
      },
      transport: {
        baseline: 0.55,
        subsectors: {
          road: 0.40,
          aviation: 0.08,
          shipping: 0.05,
          rail: 0.02,
        },
      },
      buildings: {
        baseline: 0.20,
        subsectors: {
          residential: 0.12,
          commercial: 0.08,
        },
      },
      agriculture: {
        baseline: 0.80,
        subsectors: {
          livestock: 0.35,
          crops: 0.15,
          landUse: 0.30,
        },
      },
    },
  },
  europe: {
    name: "Europe",
    developmentLevel: "developed",
    countries: ["germany", "uk", "france", "italy", "poland", "russia", "spain", "netherlands", "sweden", "norway"],
    gdp: 17.9,
    baseIncome: 12,
    sectorIncome: {
      electricity: 2,
      transport: 3,
      industry: 4,
      buildings: 2,
      agriculture: 1,
    },
    avgPotential: {
      solar: 0.50,
      wind: 0.80,
      forest: 0.55,
      carbonCapture: 0.65,
    },
    diplomatic: {
      joinDifficulty: 3,
      baseDemands: ["carbonTaxLimit"],
      personality: "cooperative",
      description: "Climate leader, eager to join but wants fair policies",
    },
    power: {
      baseDemandGW: 450,
      demandGrowthRate: 0.008,
      currentMixTWh: {
        coal: 440,
        gas: 640,
        nuclear: 920,
        hydro: 560,
        wind: 640,
        solar: 320,
        other: 480,
      },
      potentialGW: {
        solar: 500,
        wind: 800,
        hydro: 250,
        geothermal: 40,
        nuclear: 120,
      },
    },
    sectorEmissions: {
      industry: {
        baseline: 1.0,
        subsectors: {
          cement: 0.12,
          steel: 0.18,
          chemicals: 0.29,
          other: 0.41,
        },
      },
      transport: {
        baseline: 1.10,
        subsectors: {
          road: 0.75,
          aviation: 0.20,
          shipping: 0.10,
          rail: 0.05,
        },
      },
      buildings: {
        baseline: 0.70,
        subsectors: {
          residential: 0.45,
          commercial: 0.25,
        },
      },
      agriculture: {
        baseline: 0.50,
        subsectors: {
          livestock: 0.25,
          crops: 0.18,
          landUse: 0.07,
        },
      },
    },
  },
  africa: {
    name: "Africa",
    developmentLevel: "developing",
    countries: ["south_africa", "egypt", "nigeria"],
    gdp: 1.2,
    baseIncome: 2,
    sectorIncome: {
      electricity: 0.3,
      transport: 0.3,
      industry: 0.4,
      buildings: 0.2,
      agriculture: 0.8,
    },
    avgPotential: {
      solar: 0.92,
      wind: 0.65,
      forest: 0.45,
      carbonCapture: 0.50,
    },
    diplomatic: {
      joinDifficulty: 6,
      baseDemands: ["localSpending", "economicProjects", "jobPriority"],
      personality: "demanding",
      description: "Needs development investment, skeptical of climate costs",
    },
    power: {
      baseDemandGW: 110,
      demandGrowthRate: 0.055,
      currentMixTWh: {
        coal: 270,
        gas: 270,
        nuclear: 18,
        hydro: 180,
        wind: 45,
        solar: 63,
        other: 54,
      },
      potentialGW: {
        solar: 3000,
        wind: 800,
        hydro: 400,
        geothermal: 100,
        nuclear: 30,
      },
    },
    sectorEmissions: {
      industry: {
        baseline: 0.25,
        subsectors: {
          cement: 0.07,
          steel: 0.06,
          chemicals: 0.04,
          other: 0.08,
        },
      },
      transport: {
        baseline: 0.40,
        subsectors: {
          road: 0.30,
          aviation: 0.05,
          shipping: 0.04,
          rail: 0.01,
        },
      },
      buildings: {
        baseline: 0.18,
        subsectors: {
          residential: 0.13,
          commercial: 0.05,
        },
      },
      agriculture: {
        baseline: 0.55,
        subsectors: {
          livestock: 0.20,
          crops: 0.12,
          landUse: 0.23,
        },
      },
    },
  },
  asia: {
    name: "Asia",
    developmentLevel: "emerging",
    countries: ["china", "india", "japan", "south_korea", "indonesia", "saudi_arabia", "iran", "uae"],
    gdp: 31.6,
    baseIncome: 18,
    sectorIncome: {
      electricity: 4,
      transport: 3,
      industry: 7,
      buildings: 2,
      agriculture: 2,
    },
    avgPotential: {
      solar: 0.85,
      wind: 0.65,
      forest: 0.55,
      carbonCapture: 0.70,
    },
    diplomatic: {
      joinDifficulty: 7,
      baseDemands: ["carbonTaxLimit", "noNuclear", "economicProjects"],
      personality: "isolationist",
      description: "Complex politics, prioritizes sovereignty and industry",
    },
    power: {
      baseDemandGW: 2100,
      demandGrowthRate: 0.045,
      currentMixTWh: {
        coal: 8250,
        gas: 2475,
        nuclear: 825,
        hydro: 2145,
        wind: 1155,
        solar: 1320,
        other: 330,
      },
      potentialGW: {
        solar: 5000,
        wind: 3000,
        hydro: 600,
        geothermal: 150,
        nuclear: 300,
      },
    },
    sectorEmissions: {
      industry: {
        baseline: 6.5,
        subsectors: {
          cement: 1.75,
          steel: 2.15,
          chemicals: 1.30,
          other: 1.30,
        },
      },
      transport: {
        baseline: 4.20,
        subsectors: {
          road: 3.00,
          aviation: 0.55,
          shipping: 0.50,
          rail: 0.15,
        },
      },
      buildings: {
        baseline: 2.20,
        subsectors: {
          residential: 1.40,
          commercial: 0.80,
        },
      },
      agriculture: {
        baseline: 2.30,
        subsectors: {
          livestock: 1.00,
          crops: 0.90,
          landUse: 0.40,
        },
      },
    },
  },
  oceania: {
    name: "Oceania",
    developmentLevel: "developed",
    countries: ["australia"],
    gdp: 1.7,
    baseIncome: 3,
    sectorIncome: {
      electricity: 0.6,
      transport: 0.5,
      industry: 0.8,
      buildings: 0.4,
      agriculture: 0.7,
    },
    avgPotential: {
      solar: 0.95,
      wind: 0.85,
      forest: 0.50,
      carbonCapture: 0.75,
    },
    diplomatic: {
      joinDifficulty: 4,
      baseDemands: ["localSpending"],
      personality: "cooperative",
      description: "Climate-aware, wants to ensure local benefits",
    },
    power: {
      baseDemandGW: 55,
      demandGrowthRate: 0.02,
      currentMixTWh: {
        coal: 120,
        gas: 60,
        nuclear: 0,
        hydro: 21,
        wind: 45,
        solar: 48,
        other: 6,
      },
      potentialGW: {
        solar: 1000,
        wind: 500,
        hydro: 40,
        geothermal: 20,
        nuclear: 0,
      },
    },
    sectorEmissions: {
      industry: {
        baseline: 0.10,
        subsectors: {
          cement: 0.01,
          steel: 0.02,
          chemicals: 0.03,
          other: 0.04,
        },
      },
      transport: {
        baseline: 0.12,
        subsectors: {
          road: 0.08,
          aviation: 0.025,
          shipping: 0.01,
          rail: 0.005,
        },
      },
      buildings: {
        baseline: 0.06,
        subsectors: {
          residential: 0.04,
          commercial: 0.02,
        },
      },
      agriculture: {
        baseline: 0.10,
        subsectors: {
          livestock: 0.06,
          crops: 0.025,
          landUse: 0.015,
        },
      },
    },
  },
};
