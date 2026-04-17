import { useState } from "react";
import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function StudentQuestionnaire({ userName, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 0,
      question: "What is your current academic level?",
      options: [
        "High School (10+2)",
        "Bachelor's Degree",
        "Master's Degree",
        "PhD/Research",
        "Other"
      ]
    },
    {
      id: 1,
      question: "What is your field of study?",
      options: [
        "Engineering",
        "Science",
        "Commerce",
        "Arts/Humanities",
        "Other"
      ]
    },
    {
      id: 2,
      question: "Are you interested in internships or career opportunities?",
      options: [
        "Yes, very interested",
        "Somewhat interested",
        "Not sure",
        "Not interested"
      ]
    },
    {
      id: 3,
      question: "Would you like to participate in ONGC-sponsored events/workshops?",
      options: [
        "Yes, definitely",
        "Maybe",
        "Not sure",
        "Not interested"
      ]
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || user?._id;

      // Format answers
      const formattedAnswers = {};
      questions.forEach((q, index) => {
        formattedAnswers[index] = answers[index] || null;
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "https://ongc-q48j.vercel.app/api"}/auth/student-survey`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            userId,
            answers: formattedAnswers,
            studentSurveyAnswers: formattedAnswers,
            surveyCompletedAt: new Date().toISOString()
          })
        }
      );

      if (res.ok) {
        // Update sessionStorage with survey status
        if (user) {
          user.studentSurveyCompleted = true;
          user.studentSurveyAnswers = formattedAnswers;
          sessionStorage.setItem("user", JSON.stringify(user));
        }
        onComplete();
      } else {
        console.error("Survey submission failed:", res.status);
        onComplete();
      }
    } catch (err) {
      console.error("Error submitting student survey:", err);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome, {userName}! 👋
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Tell us a bit about yourself as a Student
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-6 sm:mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-6 sm:mb-8 flex-grow">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {questions[currentQuestion].question}
          </h3>

          {/* Options */}
          <div className="space-y-2 sm:space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  setAnswers({ ...answers, [currentQuestion]: option })
                }
                className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === option
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base text-gray-900">{option}</span>
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                      answers[currentQuestion] === option
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {answers[currentQuestion] === option && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 sm:gap-4 justify-between mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!answers[currentQuestion]}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium flex-1 sm:flex-none"
            >
              Complete
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
              className="flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium flex-1 sm:flex-none"
            >
              Next
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
