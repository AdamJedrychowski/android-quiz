import { useEffect, useState } from 'react';
import { getQuestions } from '../services/api.service';
import { Question, Answer } from '../types';

export default function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all questions (or a large batch)
      const response = await getQuestions(1, 100);
      
      // Shuffle questions for random order
      const shuffled = [...response.questions].sort(() => Math.random() - 0.5);
      
      setQuestions(shuffled);
      setTotal(response.total);
    } catch (err: any) {
      console.error('Error loading questions:', err);
      setError(err.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleAnswerClick = (optionLabel: string) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(optionLabel);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={loadQuestions}>Retry</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="no-questions">
        <p>No questions found. Upload a CSV file to get started!</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const sortedAnswers = currentQuestion.answers.sort((a, b) => 
    a.optionLabel.localeCompare(b.optionLabel)
  );

  return (
    <div className="question-list">
      <div className="quiz-header">
        <h2>Question {currentIndex + 1} of {questions.length}</h2>
        {total > questions.length && (
          <p className="total-info">({total} total questions in database)</p>
        )}
      </div>

      <div className="quiz-container">
        <div className="question-card">
          <h3 className="question-text">{currentQuestion.questionText}</h3>
          
          <div className="answers">
            {sortedAnswers.map((answer: Answer) => {
              const isSelected = selectedAnswer === answer.optionLabel;
              const isCorrect = answer.isCorrect;
              const showResult = selectedAnswer !== null;
              
              let answerClass = 'answer clickable';
              if (showResult) {
                if (isCorrect) {
                  answerClass += ' correct-answer';
                } else if (isSelected && !isCorrect) {
                  answerClass += ' incorrect-answer';
                }
              }

              return (
                <div
                  key={answer.id}
                  className={answerClass}
                  onClick={() => handleAnswerClick(answer.optionLabel)}
                >
                  <span className="answer-label">{answer.optionLabel.toUpperCase()}</span>
                  <span className="answer-text">{answer.answerText}</span>
                  {showResult && isCorrect && (
                    <span className="correct-badge">✓ Correct</span>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <span className="incorrect-badge">✗ Wrong</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="quiz-navigation">
          <button 
            onClick={handlePreviousQuestion} 
            disabled={currentIndex === 0}
            className="nav-button"
          >
            ← Previous
          </button>
          
          {selectedAnswer && (
            <button 
              onClick={handleNextQuestion} 
              disabled={currentIndex === questions.length - 1}
              className="nav-button primary"
            >
              {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question →'}
            </button>
          )}
        </div>

        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
