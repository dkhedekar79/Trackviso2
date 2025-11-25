export const masteryTopics = {
  GCSE: {
    AQA: {
      Mathematics: [
        { id: 'algebra', name: 'Algebra' },
        { id: 'geometry', name: 'Geometry' }
      ],
      'English Literature': [
        { id: 'poetry', name: 'Poetry' },
        { id: 'prose', name: 'Prose' }
      ]
    },
    Edexcel: {
      Physics: [
        { id: 'forces', name: 'Forces and Motion' },
        { id: 'energy', name: 'Energy' }
      ]
    },
    OCR: {}
  }
};

export const getTopicsForSubject = (qualification, examBoard, subject) => {
  return masteryTopics[qualification]?.[examBoard]?.[subject] || [];
};

export const getExamBoardsForQualification = (qualification) => {
  const quals = masteryTopics[qualification];
  return quals ? Object.keys(quals) : [];
};

export const getSubjectsForExamBoard = (qualification, examBoard) => {
  const subjects = masteryTopics[qualification]?.[examBoard];
  return subjects ? Object.keys(subjects) : [];
};

export const getAllQualifications = () => {
  return Object.keys(masteryTopics);
};
