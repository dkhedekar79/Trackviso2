export const knowledgeDatabase = {
  qualifications: [
    {
      id: 'gcse',
      name: 'GCSE',
      examBoards: [
        {
          id: 'aqa',
          name: 'AQA',
          subjects: [
            {
              id: 'maths',
              name: 'Mathematics',
              topics: [
                {
                  id: 'algebra',
                  name: 'Algebra',
                  notes: {
                    title: 'Algebra - Complete Guide',
                    summary: 'Master algebraic concepts including equations, expressions, and functions.',
                    mainPoints: [
                      {
                        heading: 'Algebraic Expressions',
                        content: 'An algebraic expression is a combination of variables, numbers, and operations. Understanding how to simplify and manipulate expressions is fundamental to algebra.',
                        examples: [
                          'Simplifying 2x + 3x = 5x',
                          'Expanding brackets: 2(x + 3) = 2x + 6',
                          'Factoring: 6x + 9 = 3(2x + 3)'
                        ]
                      },
                      {
                        heading: 'Linear Equations',
                        content: 'Linear equations are equations where the highest power of the variable is 1. Solving them involves isolating the variable on one side.',
                        examples: [
                          'Solving 2x + 5 = 13: x = 4',
                          'Two-step equations: 3x - 2 = 10',
                          'Equations with variables on both sides'
                        ]
                      },
                      {
                        heading: 'Quadratic Equations',
                        content: 'Quadratic equations have the form ax² + bx + c = 0. They can be solved using factoring, completing the square, or the quadratic formula.',
                        examples: [
                          'Using the quadratic formula',
                          'Factoring trinomials',
                          'Completing the square method'
                        ]
                      }
                    ],
                    keyTerms: [
                      {
                        term: 'Variable',
                        definition: 'A symbol (usually a letter) that represents an unknown number or value.'
                      },
                      {
                        term: 'Expression',
                        definition: 'A combination of variables, numbers, and operations without an equals sign.'
                      },
                      {
                        term: 'Equation',
                        definition: 'A mathematical statement with an equals sign showing two equal quantities.'
                      },
                      {
                        term: 'Coefficient',
                        definition: 'The number multiplied by a variable in a term.'
                      },
                      {
                        term: 'Linear',
                        definition: 'Relating to equations or graphs with degree 1 (straight lines).'
                      }
                    ],
                    practiceQuestions: [
                      {
                        question: 'Simplify: 3x + 2y + 5x - y',
                        options: [
                          'Option A: 8x + y',
                          'Option B: 8x + 3y',
                          'Option C: 3x + y',
                          'Option D: 5x + 2y'
                        ],
                        correctAnswer: 'Option A: 8x + y',
                        explanation: 'Combine like terms: 3x + 5x = 8x and 2y - y = y'
                      },
                      {
                        question: 'Solve: 2x + 7 = 15',
                        options: [
                          'Option A: x = 4',
                          'Option B: x = 11',
                          'Option C: x = 8',
                          'Option D: x = 3'
                        ],
                        correctAnswer: 'Option A: x = 4',
                        explanation: 'Subtract 7 from both sides: 2x = 8. Divide by 2: x = 4'
                      }
                    ]
                  }
                },
                {
                  id: 'geometry',
                  name: 'Geometry',
                  notes: {
                    title: 'Geometry - Shapes and Angles',
                    summary: 'Learn about shapes, angles, and spatial relationships.',
                    mainPoints: [
                      {
                        heading: 'Basic Shapes',
                        content: 'Understanding the properties of basic 2D shapes is essential.',
                        examples: [
                          'Triangles: sum of angles = 180°',
                          'Quadrilaterals: sum of angles = 360°',
                          'Regular polygons and their properties'
                        ]
                      }
                    ],
                    keyTerms: [
                      {
                        term: 'Polygon',
                        definition: 'A closed shape made up of straight line segments.'
                      }
                    ],
                    practiceQuestions: [
                      {
                        question: 'What is the sum of angles in a triangle?',
                        options: [
                          'Option A: 90°',
                          'Option B: 180°',
                          'Option C: 270°',
                          'Option D: 360°'
                        ],
                        correctAnswer: 'Option B: 180°',
                        explanation: 'The sum of angles in any triangle is always 180 degrees.'
                      }
                    ]
                  }
                }
              ]
            },
            {
              id: 'english',
              name: 'English Literature',
              topics: [
                {
                  id: 'shakespeare',
                  name: 'Shakespeare Plays',
                  notes: {
                    title: 'Shakespeare - Understanding the Bard',
                    summary: 'Explore the works of William Shakespeare and literary techniques.',
                    mainPoints: [
                      {
                        heading: 'Shakespearean Plays',
                        content: 'Shakespeare wrote tragedies, comedies, and histories. Each has distinct characteristics and themes.',
                        examples: [
                          'Tragedies: Hamlet, Macbeth, Othello',
                          'Comedies: A Midsummer Night\'s Dream, Much Ado About Nothing',
                          'Histories: Henry V, Richard III'
                        ]
                      }
                    ],
                    keyTerms: [
                      {
                        term: 'Tragedy',
                        definition: 'A play with a serious or sad ending, often involving the downfall of the protagonist.'
                      }
                    ],
                    practiceQuestions: [
                      {
                        question: 'Which of these is a Shakespearean tragedy?',
                        options: [
                          'Option A: A Midsummer Night\'s Dream',
                          'Option B: Macbeth',
                          'Option C: The Tempest',
                          'Option D: Twelfth Night'
                        ],
                        correctAnswer: 'Option B: Macbeth',
                        explanation: 'Macbeth is one of Shakespeare\'s most famous tragedies, ending with the downfall of the main character.'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'edexcel',
          name: 'Edexcel',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              topics: [
                {
                  id: 'forces',
                  name: 'Forces and Motion',
                  notes: {
                    title: 'Forces and Motion',
                    summary: 'Understanding Newton\'s laws and how forces affect motion.',
                    mainPoints: [
                      {
                        heading: 'Newton\'s First Law',
                        content: 'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.',
                        examples: [
                          'A book on a table remains stationary',
                          'A ball rolling on ice continues unless friction acts on it',
                          'Seatbelts prevent passengers from moving forward when a car stops'
                        ]
                      }
                    ],
                    keyTerms: [
                      {
                        term: 'Force',
                        definition: 'A push or pull that can change an object\'s motion or shape.'
                      }
                    ],
                    practiceQuestions: [
                      {
                        question: 'What does Newton\'s second law state?',
                        options: [
                          'Option A: F = ma',
                          'Option B: Objects attract each other',
                          'Option C: Energy cannot be created',
                          'Option D: Speed is always constant'
                        ],
                        correctAnswer: 'Option A: F = ma',
                        explanation: 'Newton\'s second law states Force = mass × acceleration (F = ma)'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'ocr',
          name: 'OCR',
          subjects: []
        }
      ]
    },
    {
      id: 'alevel',
      name: 'A-Level',
      examBoards: [
        {
          id: 'aqa',
          name: 'AQA',
          subjects: []
        },
        {
          id: 'edexcel',
          name: 'Edexcel',
          subjects: []
        },
        {
          id: 'ocr',
          name: 'OCR',
          subjects: []
        }
      ]
    }
  ]
};

// Helper function to get all topics for a qualification/board/subject
export function getTopicsForSubject(qualification, examBoard, subject) {
  const qual = knowledgeDatabase.qualifications.find(q => q.id === qualification);
  if (!qual) return [];

  const board = qual.examBoards.find(b => b.id === examBoard);
  if (!board) return [];

  const subj = board.subjects.find(s => s.id === subject);
  if (!subj) return [];

  return subj.topics;
}

// Helper function to get notes for a specific topic
export function getNotesForTopic(qualification, examBoard, subject, topicId) {
  const topics = getTopicsForSubject(qualification, examBoard, subject);
  const topic = topics.find(t => t.id === topicId);
  return topic?.notes || null;
}

// Helper function to get all subjects for a board
export function getSubjectsForBoard(qualification, examBoard) {
  const qual = knowledgeDatabase.qualifications.find(q => q.id === qualification);
  if (!qual) return [];

  const board = qual.examBoards.find(b => b.id === examBoard);
  if (!board) return [];

  return board.subjects;
}

// Helper function to get all exam boards for a qualification
export function getExamBoardsForQualification(qualification) {
  const qual = knowledgeDatabase.qualifications.find(q => q.id === qualification);
  if (!qual) return [];

  return qual.examBoards;
}
