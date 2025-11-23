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
                    summary: 'Master algebraic concepts including notation, equations, expressions, functions, sequences, graphs and full problem-solving techniques aligned to the AQA GCSE Maths specification.',
                    mainPoints: [
                      {
                        heading: 'A1 - Algebraic Notation',
                        content:
                          'Algebra uses symbols to represent numbers and operations. Key notation includes ab for a×b, 3y for repeated addition, a² and a³ for powers, and a/b for division. Terms have coefficients, variables, and powers. Expressions should always be simplified fully, using index laws and correct grouping with brackets.'
                      },
                      {
                        heading: 'A2 & A3 - Substitution, Expressions, Equations, Identities',
                        content:
                          'Substitute numerical values accurately into expressions and formulae, including scientific ones. Understand the difference between expressions, equations, inequalities, identities, terms, and factors. Recognise when equations have one solution, no solution, or infinitely many (identities).'
                      },
                      {
                        heading: 'A4 - Simplifying & Manipulating Expressions',
                        content:
                          'Manipulate expressions by collecting like terms, expanding brackets, factorising, and applying index laws. At higher level, expand double or multiple binomials, factorise quadratics of the form x²+bx+c and ax²+bx+c, work with algebraic fractions, and simplify or rationalise surds.'
                      },
                      {
                        heading: 'A5 & A6 - Formulae, Rearranging, Algebraic Proof',
                        content:
                          'Interpret and use standard mathematical formulae from words or symbols. Rearrange formulae to change the subject, including those involving fractions, powers and roots. Construct algebraic proofs by manipulating expressions rigorously, using identities and general arguments such as even–odd reasoning.'
                      },
                      {
                        heading: 'A7 - Functions, Inverse & Composite Functions',
                        content:
                          'Interpret expressions as functions mapping inputs to outputs. Use f(x), fg(x) and f⁻¹(x) notation. Form composite functions by applying one function inside another. Find inverse functions by swapping x and y and rearranging.'
                      },
                      {
                        heading: 'A9 & A10 - Straight Line Graphs',
                        content:
                          'Plot and interpret lines in the form y = mx + c. Identify gradients and intercepts graphically or algebraically. Determine parallel and perpendicular lines using gradient conditions. Find equations of lines from points or gradients.'
                      },
                      {
                        heading: 'A11 & A12 - Quadratic, Cubic, Reciprocal, Exponential & Trig Graphs',
                        content:
                          'Recognise and sketch linear, quadratic, cubic, reciprocal (y=1/x), exponential (y=k^x), and trigonometric graphs (sin, cos, tan). Identify roots, turning points, and intercepts of quadratics. Deduce turning points by completing the square and use symmetry at x = -b/(2a).'
                      },
                      {
                        heading: 'A13 - Transformations of Functions',
                        content:
                          'Transform graphs using translations, reflections, and stretches. For example, f(x)+a shifts up, f(x−a) shifts right, af(x) stretches vertically, and f(−x) reflects in the y-axis.'
                      },
                      {
                        heading: 'A14 & A15 - Graphs in Context, Gradients & Areas',
                        content:
                          'Use graphs to solve real problems, including distance–time and velocity–time graphs. Estimate gradients using tangents and estimate areas under curves using trapezium-like methods. Apply these to contexts such as acceleration or financial modelling.'
                      },
                      {
                        heading: 'A16 - Circles and Tangents',
                        content:
                          'Know and use the circle equation x² + y² = r² for a circle centred at the origin. Find the tangent at a point by using the perpendicular gradient to the radius.'
                      },
                      {
                        heading: 'A17–A20 - Solving Equations, Simultaneous Equations, Quadratics, Iteration',
                        content:
                          'Solve linear equations, including those with brackets or variables on both sides. Solve quadratics by factorising, completing the square, or using the quadratic formula. Solve simultaneous linear systems algebraically and linear–quadratic pairs graphically or algebraically. Use iteration with recursive formulae to approximate solutions.'
                      },
                      {
                        heading: 'A21 & A22 - Modelling, Inequalities & Solution Sets',
                        content:
                          'Translate real situations into algebra, form equations or systems, solve them and interpret solutions. Solve linear and quadratic inequalities, representing solutions on number lines, using set notation or showing boundary lines on graphs.'
                      },
                      {
                        heading: 'A23–A25 - Sequences & nth Terms',
                        content:
                          'Generate sequences from term-to-term or position-to-term rules. Recognise triangular, square, cube, arithmetic, Fibonacci-type, quadratic and geometric sequences. Find nth terms of linear sequences (an+b) and quadratic sequences (an²+bn+c).'
                      }
                    ],
                    keyTerms: [
                      { term: 'Variable', definition: 'A symbol (usually a letter) representing an unknown value.' },
                      { term: 'Expression', definition: 'A combination of variables, numbers, and operations with no equals sign.' },
                      { term: 'Equation', definition: 'A statement showing two expressions are equal using an equals sign.' },
                      { term: 'Coefficient', definition: 'The numerical factor multiplying a variable.' },
                      { term: 'Identity', definition: 'A statement that is true for all values of the variable.' },
                      { term: 'Function', definition: 'A mapping from input values (x) to output values f(x).' },
                      { term: 'Gradient', definition: 'The rate of change of a graph, usually rise over run.' },
                      { term: 'Quadratic', definition: 'An expression or equation involving x² as its highest power.' }
                    ],
                    practiceQuestions: [
                      {
                        question: 'Simplify: 4a - 3b + 2a + b',
                        options: [
                          'A: 6a - 2b',
                          'B: 6a - 4b',
                          'C: 2a - 4b',
                          'D: 4a - b'
                        ],
                        correctAnswer: 'A: 6a - 2b',
                        explanation: 'Combine like terms: 4a + 2a = 6a and -3b + b = -2b.'
                      },
                      {
                        question: 'Solve: 5(x - 2) = 3x + 6',
                        options: [
                          'A: x = 8',
                          'B: x = 4',
                          'C: x = 6',
                          'D: x = 2'
                        ],
                        correctAnswer: 'B: x = 4',
                        explanation: 'Expand to get 5x - 10 = 3x + 6. Subtract 3x: 2x - 10 = 6. Add 10: 2x = 16. Divide by 2: x = 8.'
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
