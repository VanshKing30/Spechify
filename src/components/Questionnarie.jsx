import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const questions = [
  {
    id: 1,
    category: 'Speech Fluency',
    title: 'Speech Flow and Interruptions',
    description: 'How frequently do interruptions or blockages occur when you speak?',
    options: [
      { value: 0, label: 'Smooth speech, no interruptions' },
      { value: 1, label: 'Rare, minor hesitations' },
      { value: 2, label: 'Occasional significant interruptions' },
      { value: 3, label: 'Frequent, substantial speech blocks' }
    ]
  },
  {
    id: 2,
    category: 'Communication Clarity',
    title: 'Word Finding and Expression',
    description: 'How easily can you find the right words to express your thoughts?',
    options: [
      { value: 0, label: 'Words flow naturally' },
      { value: 1, label: 'Occasional mild difficulty' },
      { value: 2, label: 'Frequent word-finding challenges' },
      { value: 3, label: 'Severe struggle expressing thoughts' }
    ]
  },
  {
    id: 3,
    category: 'Social Communication',
    title: 'Conversational Engagement',
    description: 'How comfortable are you maintaining conversations in various social settings?',
    options: [
      { value: 0, label: 'Very comfortable in all settings' },
      { value: 1, label: 'Slightly anxious in some situations' },
      { value: 2, label: 'Significant social communication anxiety' },
      { value: 3, label: 'Extreme difficulty in social interactions' }
    ]
  },
  {
    id: 4,
    category: 'Comprehension',
    title: 'Language Understanding',
    description: 'How well do you understand complex verbal instructions or conversations?',
    options: [
      { value: 0, label: 'Fully understand with ease' },
      { value: 1, label: 'Minor comprehension challenges' },
      { value: 2, label: 'Frequent comprehension difficulties' },
      { value: 3, label: 'Significant understanding barriers' }
    ]
  },
  {
    id: 5,
    category: 'Phonetic Precision',
    title: 'Sound Articulation',
    description: 'How accurately can you pronounce different sounds and words?',
    options: [
      { value: 0, label: 'Precise articulation' },
      { value: 1, label: 'Occasional mild pronunciation issues' },
      { value: 2, label: 'Regular articulation challenges' },
      { value: 3, label: 'Significant pronunciation difficulties' }
    ]
  }
];

const AdvancedQuestionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const checkQuestionnaireStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().questionnaireCompleted) {
          navigate('/patient-dashboard');
        }
      }
    };

    checkQuestionnaireStatus();
  }, [navigate]);

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].id]: value
    }));
    
    // Move to next step or submit
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    const assignedTags = [];
    
    // Advanced tag assignment logic
    if (answers[1] >= 2) assignedTags.push('speech-fluency-disorder');
    if (answers[2] >= 2) assignedTags.push('expressive-language-disorder');
    if (answers[3] >= 2) assignedTags.push('social-communication-disorder');
    if (answers[4] >= 2) assignedTags.push('receptive-language-disorder');
    if (answers[5] >= 2) assignedTags.push('articulation-disorder');

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to complete the questionnaire');
        return;
      }

      await setDoc(
        doc(db, 'users', user.uid),
        {
          questionnaireCompleted: true,
          tags: assignedTags,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      // Redirect or handle therapist assignment
      navigate('/patient-dashboard');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Error submitting questionnaire. Please try again.');
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white shadow-2xl rounded-xl p-8 max-w-md w-full space-y-6 relative">
        <div className="absolute top-4 right-4 text-sm text-gray-500">
          {currentStep + 1} / {questions.length}
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-indigo-700">{currentQuestion.category}</h3>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{currentQuestion.title}</h2>
          <p className="text-gray-600 mt-2">{currentQuestion.description}</p>
        </div>

        <div className="space-y-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full text-left p-4 rounded-lg transition duration-200 hover:bg-indigo-50 
                ${answers[currentQuestion.id] === option.value 
                  ? 'bg-indigo-100 border-2 border-indigo-500' 
                  : 'bg-gray-100 border-2 border-transparent'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          {currentStep > 0 && (
            <button 
              onClick={goBack} 
              className="flex items-center text-gray-600 hover:text-indigo-600"
            >
              <ChevronLeft className="mr-2" /> Back
            </button>
          )}

          {currentStep === questions.length - 1 && (
            <button 
              onClick={handleSubmit}
              className="ml-auto flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Submit <Check className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedQuestionnaire;