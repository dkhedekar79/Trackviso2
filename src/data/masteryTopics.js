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
    { id: 'resource-management', name: 'Resource Management' },
    { id: 'fieldwork', name: 'Geographical Applications (Issue Evaluation + Fieldwork)' }
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
      Physics: [
        { id: 'forces', name: 'Forces and Motion' }
      ]
    },
    OCR: {}
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
