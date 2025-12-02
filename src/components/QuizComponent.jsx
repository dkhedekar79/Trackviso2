import React, { useState, useEffect } from 'react';
import { knowledgeDatabase, getNotesForTopic } from '../data/knowledgeData';
import { useAuth } from '../hooks/useAuth';

function QuizComponent({ updateFreeQuizQuestionsUsed }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questions, setQuestions] = useState([]);
  const { isPremiumUser, freeQuizQuestionsUsed } = useAuth();

  // For now, hardcode a subject and topic for testing
  const qualification = 'gcse';
  const examBoard = 'aqa';
  const subject = 'maths';
  const topicId = 'algebra';

  useEffect(() => {
    const notes = getNotesForTopic(qualification, examBoard, subject, topicId);
    if (notes && notes.practiceQuestions) {
      setQuestions(notes.practiceQuestions);
    }
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!isPremiumUser) {
      updateFreeQuizQuestionsUsed(freeQuizQuestionsUsed + 1);
    }
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
  };

  if (questions.length === 0) {
    return <p>Loading quiz questions...</p>;
  }

  if (currentQuestionIndex >= questions.length) {
    return <p>Quiz completed!</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <h2>Quiz Component</h2>
      <h3>{currentQuestion.question}</h3>
      <div>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            style={{ backgroundColor: selectedAnswer === option ? 'lightblue' : 'white' }}
            disabled={showExplanation}
          >
            {option}
          </button>
        ))}
      </div>
      {!showExplanation && selectedAnswer && (
        <button onClick={handleSubmitAnswer}>Submit Answer</button>
      )}

      {showExplanation && (
        <div>
          <p>Your answer: {selectedAnswer}</p>
          <p>Correct answer: {currentQuestion.correctAnswer}</p>
          <p>Explanation: {currentQuestion.explanation}</p>
          <button onClick={handleNextQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
}

export default QuizComponent;