export const masteryTopics = {
  GCSE: {
    AQA: {
       Mathematics: [
    { id: 'number', name: 'Number' },
    { id: 'algebra', name: 'Algebra' },
    { id: 'ratio', name: 'Ratio, Proportion and Rates of Change' },
    { id: 'geometry', name: 'Geometry and Measures' },
    { id: 'probability', name: 'Probability' },
    { id: 'statistics', name: 'Statistics' }
  ],

  Biology: [
    { id: 'cells', name: 'Cell Biology' },
    { id: 'organisation', name: 'Organisation' },
    { id: 'infection', name: 'Infection and Response' },
    { id: 'bioenergetics', name: 'Bioenergetics' },
    { id: 'homeostasis', name: 'Homeostasis and Response' },
    { id: 'inheritance', name: 'Inheritance, Variation and Evolution' },
    { id: 'ecology', name: 'Ecology' }
  ],

  Chemistry: [
    { id: 'atomic-structure', name: 'Atomic Structure and the Periodic Table' },
    { id: 'bonding', name: 'Bonding, Structure and the Properties of Matter' },
    { id: 'quantitative', name: 'Quantitative Chemistry' },
    { id: 'chemical-changes', name: 'Chemical Changes' },
    { id: 'energy-changes', name: 'Energy Changes' },
    { id: 'rates', name: 'Rate and Extent of Chemical Change' },
    { id: 'organic', name: 'Organic Chemistry' },
    { id: 'chemical-analysis', name: 'Chemical Analysis' },
    { id: 'earth-chem', name: 'Chemistry of the Atmosphere' },
    { id: 'resources', name: 'Using Resources' }
  ],

  Physics: [
    { id: 'energy', name: 'Energy' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'particle-model', name: 'Particle Model of Matter' },
    { id: 'atomic-structure', name: 'Atomic Structure' },
    { id: 'forces', name: 'Forces' },
    { id: 'waves', name: 'Waves' },
    { id: 'magnetism', name: 'Magnetism and Electromagnetism' },
    { id: 'space', name: 'Space Physics (Triple Only)' }
  ],

  Economics: [
    { id: 'economic-foundations', name: 'Economic Foundations' },
    { id: 'resource-allocation', name: 'How Markets Work (Resource Allocation)' },
    { id: 'economic-performance', name: 'How the Economy Works (Economic Performance)' },
    { id: 'government-role', name: 'Government Objectives and Policies' },
    { id: 'international', name: 'International Trade and the Global Economy' },
    { id: 'financial-markets', name: 'The Role of Money and Financial Markets' }
  ],

  Geography: [
    { id: 'natural-hazards', name: 'The Challenge of Natural Hazards' },
    { id: 'living-world', name: 'The Living World' },
    { id: 'uk-landscapes', name: 'Physical Landscapes in the UK' },
    { id: 'urban-issues', name: 'Urban Issues and Challenges' },
    { id: 'changing-economic-world', name: 'The Changing Economic World' },
    { id: 'resource-management', name: 'Resource Management' }
  ],

  History: [
    // GCSE History depends on chosen route. These are AQA’s main units.
    { id: 'thematic-study', name: 'Thematic Study: Britain: Health and the People OR Power and the People OR Migration' },
    { id: 'british-depth', name: 'British Depth Study: Norman England OR Elizabethan England OR Restoration England' },
    { id: 'period-study', name: 'Period Study: Germany 1890–1945 OR America 1840–1895 OR Russia 1892–1945 OR others depending on school' },
    { id: 'wider-world', name: 'Wider World Depth Study: Conflict and Tension (WW1 / Interwar / WW2 / Cold War)' }
  ]

    },
    Edexcel: {
      Mathematics: [
        { id: 'number', name: 'Number' },
        { id: 'algebra', name: 'Algebra' },
        { id: 'ratio', name: 'Ratio, Proportion and Rates of Change' },
        { id: 'geometry', name: 'Geometry and Measures' },
        { id: 'statistics', name: 'Statistics' },
        { id: 'probability', name: 'Probability' }
      ],

      Biology: [
        { id: 'key-concepts', name: 'Key Concepts in Biology' },
        { id: 'cells', name: 'Cells and Control' },
        { id: 'genetics', name: 'Genetics' },
        { id: 'natural-selection', name: 'Natural Selection and Genetic Modification' },
        { id: 'health-disease', name: 'Health, Disease and Development of Medicines' },
        { id: 'plant-structures', name: 'Plant Structures and Their Functions' },
        { id: 'animal-coordination', name: 'Animal Coordination, Control and Homeostasis' },
        { id: 'exchange-biology', name: 'Exchange and Transport in Animals' },
        { id: 'ecosystems', name: 'Ecosystems and Material Cycles' }
      ],

      Chemistry: [
        { id: 'atomic-structure', name: 'Key Concepts in Chemistry (Atomic Structure and Periodic Table)' },
        { id: 'structure-bonding', name: 'Structure, Bonding and Properties of Matter' },
        { id: 'chemical-changes', name: 'Chemical Changes (Acids, Electrolysis, Redox)' },
        { id: 'quantitative', name: 'Quantitative Chemistry' },
        { id: 'separation-techniques', name: 'Separation Techniques' },
        { id: 'rates-equilibrium', name: 'Rates of Reaction and Equilibrium' },
        { id: 'crude-oil', name: 'Crude Oil and Fuels' },
        { id: 'earth-atmosphere', name: 'Earth and Atmospheric Science' },
        { id: 'chemical-analysis', name: 'Chemical Analysis' },
        { id: 'transition-metals', name: 'Transition Metals, Catalysts, Alloys (Triple)' }
      ],

      Physics: [
        { id: 'key-concepts', name: 'Key Concepts of Physics' },
        { id: 'motion-forces', name: 'Motion and Forces' },
        { id: 'energy', name: 'Conservation of Energy' },
        { id: 'waves', name: 'Waves' },
        { id: 'light-em', name: 'Light and the Electromagnetic Spectrum' },
        { id: 'radioactivity', name: 'Radioactivity' },
        { id: 'astronomy', name: 'Astronomy (Triple Only)' },
        { id: 'electricity', name: 'Electricity and Circuits' },
        { id: 'magnetism', name: 'Magnetism and Electromagnetism' },
        { id: 'particle-model', name: 'Particle Model' },
        { id: 'forces-matter', name: 'Forces and Matter' }
      ],

      Economics: [
        { id: 'introduction', name: 'Introduction to Economics' },
        { id: 'micro-markets', name: 'The Role of Markets and Market Failure' },
        { id: 'micro-business', name: 'Business Economics' },
        { id: 'macro-economy', name: 'The National and International Economy' }
      ],

      GeographyA: [
        { id: 'hazards', name: 'Hazardous Earth' },
        { id: 'development', name: 'Development Dynamics' },
        { id: 'challenges-uk', name: 'Challenges of an Urbanising World' },
        { id: 'uk-landscapes', name: 'UK Physical Landscapes' },
        { id: 'ecosystems', name: 'Ecosystems, Biodiversity and Management' },
        { id: 'resources', name: 'Resource Management' },
        { id: 'fieldwork', name: 'Geographical Investigations' }
      ],

      GeographyB: [
        { id: 'global-development', name: 'Global Geographical Issues' },
        { id: 'uk-geography', name: 'UK Geographical Issues' },
        { id: 'people-environment', name: 'People and the Environment Issues' },
        { id: 'fieldwork', name: 'Geographical Investigations' }
      ],

      History: [
        { id: 'thematic-study', name: 'Thematic Study (Crime & Punishment / Medicine / Migration)' },
        { id: 'british-depth', name: 'British Depth Study (Anglo-Saxon/Norman / Early Elizabethan / Henry VIII & His Ministers)' },
        { id: 'period-study', name: 'Period Study (Cold War / American West / Superpower relations / Early Elizabethan England etc.)' },
        { id: 'modern-depth', name: 'Modern Depth Study (Weimar & Nazi Germany / USA 1954–75 / Russia & Soviet Union etc.)' }
      ]
    },
    OCR: {}
  },
  IGCSE: {
    Cambridge: {
      Mathematics: [
        { id: 'number', name: 'Number' },
        { id: 'algebra', name: 'Algebra and Graphs' },
        { id: 'coordinate-geometry', name: 'Coordinate Geometry' },
        { id: 'geometry', name: 'Geometry' },
        { id: 'mensuration', name: 'Mensuration' },
        { id: 'trigonometry', name: 'Trigonometry' },
        { id: 'vectors', name: 'Vectors and Transformations' },
        { id: 'probability', name: 'Probability' },
        { id: 'statistics', name: 'Statistics' }
      ],
      Biology: [
        { id: 'characteristics', name: 'Characteristics and Classification of Living Organisms' },
        { id: 'cells', name: 'Cell Structure and Organisation' },
        { id: 'movement', name: 'Movement In and Out of Cells' },
        { id: 'biological-molecules', name: 'Biological Molecules' },
        { id: 'enzymes', name: 'Enzymes' },
        { id: 'plant-nutrition', name: 'Plant Nutrition' },
        { id: 'human-nutrition', name: 'Human Nutrition' },
        { id: 'transport', name: 'Transport in Plants and Animals' },
        { id: 'respiration', name: 'Respiration' },
        { id: 'gas-exchange', name: 'Gas Exchange in Humans' },
        { id: 'excretion', name: 'Excretion' },
        { id: 'coordination', name: 'Coordination and Response' },
        { id: 'reproduction', name: 'Reproduction' },
        { id: 'inheritance', name: 'Inheritance' },
        { id: 'variation', name: 'Variation and Selection' },
        { id: 'organisms', name: 'Organisms and Their Environment' },
        { id: 'biotechnology', name: 'Biotechnology and Genetic Engineering' },
        { id: 'human-influences', name: 'Human Influences on Ecosystems' }
      ],
      Chemistry: [
        { id: 'particulate-nature', name: 'The Particulate Nature of Matter' },
        { id: 'experimental-techniques', name: 'Experimental Techniques' },
        { id: 'atoms-elements', name: 'Atoms, Elements and Compounds' },
        { id: 'stoichiometry', name: 'Stoichiometry' },
        { id: 'electricity', name: 'Electricity and Chemistry' },
        { id: 'energy-changes', name: 'Energy Changes in Chemical Reactions' },
        { id: 'chemical-reactions', name: 'Chemical Reactions' },
        { id: 'acids-bases', name: 'Acids, Bases and Salts' },
        { id: 'periodic-table', name: 'The Periodic Table' },
        { id: 'metals', name: 'Metals' },
        { id: 'air-water', name: 'Air and Water' },
        { id: 'sulfur', name: 'Sulfur' },
        { id: 'carbonates', name: 'Carbonates' },
        { id: 'organic-chemistry', name: 'Organic Chemistry' }
      ],
      Physics: [
        { id: 'motion', name: 'Motion, Forces and Energy' },
        { id: 'thermal-physics', name: 'Thermal Physics' },
        { id: 'waves', name: 'Waves' },
        { id: 'electricity', name: 'Electricity and Magnetism' },
        { id: 'nuclear-physics', name: 'Nuclear Physics' },
        { id: 'space-physics', name: 'Space Physics' }
      ]
    },
    Edexcel: {
      Mathematics: [
        { id: 'number', name: 'Number' },
        { id: 'algebra', name: 'Algebra' },
        { id: 'graphs', name: 'Graphs' },
        { id: 'geometry', name: 'Geometry and Trigonometry' },
        { id: 'vectors', name: 'Vectors and Transformations' },
        { id: 'statistics', name: 'Statistics' },
        { id: 'probability', name: 'Probability' }
      ],
      Biology: [
        { id: 'nature-variety', name: 'The Nature and Variety of Living Organisms' },
        { id: 'structures', name: 'Structures and Functions in Living Organisms' },
        { id: 'reproduction', name: 'Reproduction and Inheritance' },
        { id: 'ecology', name: 'Ecology and the Environment' },
        { id: 'use-biological', name: 'Use of Biological Resources' }
      ],
      Chemistry: [
        { id: 'principles', name: 'Principles of Chemistry' },
        { id: 'inorganic', name: 'Inorganic Chemistry' },
        { id: 'physical', name: 'Physical Chemistry' },
        { id: 'organic', name: 'Organic Chemistry' }
      ],
      Physics: [
        { id: 'forces-motion', name: 'Forces and Motion' },
        { id: 'electricity', name: 'Electricity' },
        { id: 'waves', name: 'Waves' },
        { id: 'energy', name: 'Energy Resources and Energy Transfers' },
        { id: 'solids-liquids', name: 'Solids, Liquids and Gases' },
        { id: 'magnetism', name: 'Magnetism and Electromagnetism' },
        { id: 'radioactivity', name: 'Radioactivity and Particles' },
        { id: 'astrophysics', name: 'Astrophysics' }
      ]
    }
  }
};

/**
 * Get topics for a specific subject/qualification/examBoard combination
 * @param {string} qualification - e.g., 'GCSE'
 * @param {string} examBoard - e.g., 'AQA'
 * @param {string} subject - e.g., 'Mathematics'
 * @returns {Array} Array of topic objects with id and name
 */
export function getTopicsForSubject(qualification, examBoard, subject) {
  return masteryTopics[qualification]?.[examBoard]?.[subject] || [];
}

/**
 * Get all exam boards for a qualification
 * @param {string} qualification - e.g., 'GCSE'
 * @returns {Array} Array of exam board names
 */
export function getExamBoardsForQualification(qualification) {
  const quals = masteryTopics[qualification];
  return quals ? Object.keys(quals) : [];
}

/**
 * Get all subjects for a specific qualification and exam board
 * @param {string} qualification - e.g., 'GCSE'
 * @param {string} examBoard - e.g., 'AQA'
 * @returns {Array} Array of subject names
 */
export function getSubjectsForExamBoard(qualification, examBoard) {
  const subjects = masteryTopics[qualification]?.[examBoard];
  return subjects ? Object.keys(subjects) : [];
}

/**
 * Get all available qualifications
 * @returns {Array} Array of qualification names
 */
export function getAllQualifications() {
  return Object.keys(masteryTopics);
}

/**
 * Get all available data - useful for building UI without parameters
 * @returns {Object} The complete masteryTopics object
 */
export function getAllMasteryData() {
  return masteryTopics;
}
