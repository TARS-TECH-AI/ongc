import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import React from "react";

export default function AnyOtherQuestionnaire({ userName, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 0,
      question: "What brings you to join ONGC community?",
      options: [
        "Professional networking",
        "Social contribution",
        "Learning opportunities",
        "Business partnerships",
        "Other"
      ]
    },
    {
      id: 1,
      question: "What are your main interests?",
      options: [
        "Technology & Innovation",
        "Environment & Sustainability",
        "Education & Skills",
        "Social Development",
        "Multiple interests"
      ]
    },
    {
      id: 2,
      question: "How often would you like to engage with ONGC initiatives?",
      options: [
        "Regularly (Monthly)",
        "Occasionally (Quarterly)",
        "Rarely (Annually)",
        "As needed",
        "Not sure"
      ]
    },
    {
      id: 3,
      question: "What kind of support would benefit you most?",
      options: [
        "Mentorship & Guidance",
        "Networking Opportunities",
        "Resources & Tools",
        "Financial Support",
        "Other"
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
        `${import.meta.env.VITE_API_URL || "https://ongc-q48j.vercel.app/api"}/auth/other-survey`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            userId,
            answers: formattedAnswers,
            otherSurveyAnswers: formattedAnswers,
            surveyCompletedAt: new Date().toISOString()
          })
        }
      );

      if (res.ok) {
        // Update sessionStorage with survey status
        if (user) {
          user.otherSurveyCompleted = true;
          user.otherSurveyAnswers = formattedAnswers;
          sessionStorage.setItem("user", JSON.stringify(user));
        }
        onComplete();
      } else {
        console.error("Survey submission failed:", res.status);
        onComplete();
      }
    } catch (err) {
      console.error("Error submitting other survey:", err);
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
            Let's know you better!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-6 sm:mb-8">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
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
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base text-gray-900">{option}</span>
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                      answers[currentQuestion] === option
                        ? "border-orange-600 bg-orange-600"
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
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium flex-1 sm:flex-none"
            >
              Complete
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
              className="flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium flex-1 sm:flex-none"
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
