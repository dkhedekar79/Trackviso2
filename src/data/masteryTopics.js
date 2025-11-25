export const masteryTopics = {
  GCSE: {
    AQA: {
      Mathematics: [
        { id: 'algebra', name: 'Algebra' },
        { id: 'geometry', name: 'Geometry' }
      ],
      'English Literature': [
        { id: 'shakespeare', name: 'Shakespeare Plays' }
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
