import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

const questions = [
  { 
    id: 1, 
    text: "How often do you have difficulty pronouncing specific sounds or words?", 
    options: ["Rarely", "Occasionally", "Frequently", "Almost always"]
  },
  { 
    id: 2, 
    text: "Do you find it challenging to understand spoken language during conversations?", 
    options: ["Not at all", "Sometimes", "Often", "Always"]
  },
  { 
    id: 3, 
    text: "How comfortable do you feel speaking in front of groups?", 
    options: ["Very comfortable", "Somewhat comfortable", "Somewhat uncomfortable", "Very uncomfortable"]
  },
  { 
    id: 4, 
    text: "Have you experienced stuttering (repeating sounds, syllables, or words) while speaking?", 
    options: ["Never", "Rarely", "Frequently", "Almost every time I speak"]
  },
  { 
    id: 5, 
    text: "Do you find it difficult to express your thoughts clearly and find the right words?", 
    options: ["No difficulty", "Somewhat difficult", "Difficult", "Extremely difficult"]
  },
  { 
    id: 6, 
    text: "Do others have trouble understanding you when you speak?", 
    options: ["Rarely", "Occasionally", "Frequently", "Almost always"]
  },
  { 
    id: 7, 
    text: "Are there any specific sounds or words that you consistently have trouble with?", 
    options: ["None", "A few sounds/words", "Many sounds/words", "Almost all sounds/words"]
  },
  { 
    id: 8, 
    text: "How well can you maintain a conversation without losing focus or needing frequent pauses?", 
    options: ["Very well", "Somewhat well", "With difficulty", "With extreme difficulty"]
  },
  { 
    id: 9, 
    text: "Do you have trouble with understanding or following complex instructions?", 
    options: ["Never", "Occasionally", "Often", "Always"]
  },
  { 
    id: 10, 
    text: "Have you been diagnosed with any speech, language, or communication disorder in the past?", 
    options: ["No", "Yes, speech disorder (e.g., articulation issues)", "Yes, language disorder (e.g., expressive/receptive issues)", "Yes, another communication-related disorder"]
  }
];

const Questionnaire = () => {
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const checkQuestionnaireStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().questionnaireCompleted) {
          navigate('/patient-dashboard'); // Redirect if questionnaire is completed
        }
      }
    };

    checkQuestionnaireStatus();
  }, [navigate]);

  const handleChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
  };

  const assignTherapist = async (patientId, patientTags) => {
    try {
      // Query therapists with matching tags and availability
      const therapistQuery = query(
        collection(db, 'users'),
        where('role', '==', 'therapist'),
        where('specialtyTags', 'array-contains-any', patientTags),
        where('active', '==', true)
      );
  
      const therapistSnapshot = await getDocs(therapistQuery);
      let therapists = [];
  
      // Gather all therapists matching tags
      therapistSnapshot.forEach((doc) => {
        const therapist = doc.data();
        therapists.push({ id: doc.id, ...therapist });
      });
  
      if (therapists.length === 0) {
        alert('No available therapist found for your issues. Please try again later.');
        return;
      }
  
      // Sort therapists by workload (ascending order of currentPatients.length)
      therapists.sort((a, b) => a.currentPatients.length - b.currentPatients.length);
  
      // Allocate to the therapist with the least number of patients
      const assignedTherapist = therapists.find(
        (therapist) => therapist.currentPatients.length < therapist.maxPatients
      );
  
      if (!assignedTherapist) {
        alert('All therapists are currently at capacity. Please try again later.');
        return;
      }
  
      // Update therapist's patient list
      const updatedPatients = [...assignedTherapist.currentPatients, patientId];
      await updateDoc(doc(db, 'users', assignedTherapist.id), {
        currentPatients: updatedPatients,
        updatedAt: new Date().toISOString()
      });
  
      // Update patient's therapist assignment
      await updateDoc(doc(db, 'users', patientId), {
        assignedTherapist: assignedTherapist.id,
        updatedAt: new Date().toISOString()
      });
  
      alert(`You have been assigned to therapist: ${assignedTherapist.name}`);
      navigate('/patient-dashboard');
    } catch (error) {
      console.error('Error assigning therapist:', error);
      alert('An error occurred while assigning a therapist. Please try again.');
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const assignedTags = [];
    // Map answers to tags (existing logic)
    if (answers[1] === "Frequently" || answers[1] === "Almost always") assignedTags.push("articulation-disorder");
    if (answers[7] === "Many sounds/words" || answers[7] === "Almost all sounds/words") assignedTags.push("articulation-disorder");
    if (answers[2] === "Often" || answers[2] === "Always") assignedTags.push("language-disorder");
    // ... (continue with existing mapping logic)

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to complete the questionnaire');
        return;
      }

      // Save tags to patient's profile
      await setDoc(
        doc(db, 'users', user.uid),
        {
          questionnaireCompleted: true,
          tags: assignedTags,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      // Assign therapist to the patient
      await assignTherapist(user.uid, assignedTags);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Error submitting questionnaire. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">Questionnaire</h2>
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <p className="text-gray-700">{question.text}</p>
            {question.options.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => handleChange(question.id, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Questionnaire;