import React, { useState } from "react";

const NGOQuestionnaire = ({ onComplete, userName }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 1,
      question: "What is the primary focus area of your NGO?",
      options: [
        "Education",
        "Healthcare",
        "Environmental Conservation",
        "Social Welfare",
        "Other"
      ]
    },
    {
      id: 2,
      question: "How many people does your NGO serve?",
      options: [
        "Less than 100",
        "100 - 500",
        "500 - 1000",
        "1000 - 5000",
        "More than 5000"
      ]
    },
    {
      id: 3,
      question: "How long has your NGO been operating?",
      options: [
        "Less than 1 year",
        "1 - 3 years",
        "3 - 5 years",
        "5 - 10 years",
        "More than 10 years"
      ]
    },
    {
      id: 4,
      question: "Are you interested in collaborating with ONGC?",
      options: [
        "Yes, definitely",
        "Maybe, tell me more",
        "Not sure yet",
        "Not interested",
        "Already collaborating"
      ]
    }
  ];

  const handleSelectOption = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion]: option
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const userStr = sessionStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || user?._id;

      // Format answers with question text for storage
      const formattedAnswers = {};
      questions.forEach((q, index) => {
        formattedAnswers[index] = answers[index] || null;
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api'}/auth/ngo-survey`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId,
            answers: formattedAnswers,
            ngoSurveyAnswers: formattedAnswers,
            surveyCompletedAt: new Date().toISOString()
          })
        }
      );

      if (res.ok) {
        // Update sessionStorage with survey status
        if (user) {
          user.ngoSurveyCompleted = true;
          user.ngoSurveyAnswers = formattedAnswers;
          sessionStorage.setItem('user', JSON.stringify(user));
        }
        onComplete();
      } else {
        console.error('Survey submission failed:', res.status);
        onComplete();
      }
    } catch (err) {
      console.error('Error submitting NGO survey:', err);
      onComplete();
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="mb-5 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#0C2E50] to-orange-500 bg-clip-text text-transparent mb-1 sm:mb-2">
            NGO Survey
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome {userName}! Help us understand your organization better.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-orange-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6 sm:mb-8 flex-grow">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
            {questions[currentQuestion].question}
          </h3>

          {/* Options */}
          <div className="grid gap-2 sm:gap-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(option)}
                className={`p-3 sm:p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === option
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-sm sm:text-base text-gray-700">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1);
              }
            }}
            disabled={currentQuestion === 0}
            className="px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
            {Object.keys(answers).length} answered
          </span>

          <button
            onClick={() => {
              if (currentQuestion === questions.length - 1) {
                handleSubmit();
              } else {
                if (answers[currentQuestion]) {
                  setCurrentQuestion(currentQuestion + 1);
                }
              }
            }}
            disabled={!answers[currentQuestion]}
            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-[100px] sm:w-auto text-center"
          >
            {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NGOQuestionnaire;
