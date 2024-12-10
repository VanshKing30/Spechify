import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const PatientTherapyPlan = () => {
  const [therapyPlan, setTherapyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTherapyPlan = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No user logged in');
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().therapyPlan) {
          setTherapyPlan(userDoc.data().therapyPlan);
        } else {
          setError('No therapy plan found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching therapy plan:', error);
        setError('Failed to fetch therapy plan');
        setLoading(false);
      }
    };

    fetchTherapyPlan();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading therapy plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Therapy Plan</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Therapy Goals</h2>
            <p className="text-gray-600">{therapyPlan.goals || 'No goals specified'}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Therapy Techniques</h2>
            <div className="space-y-2">
              {Array.isArray(therapyPlan.techniques) ? (
                therapyPlan.techniques.map((technique, index) => (
                  <div key={index} className="flex items-center">
                    <svg 
                      className="w-4 h-4 text-green-500 mr-2" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span>{technique}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">{therapyPlan.techniques || 'No techniques specified'}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Session Frequency</h2>
              <p className="text-gray-600">{therapyPlan.sessionFrequency || 'Not specified'}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Duration</h2>
              <p className="text-gray-600">{therapyPlan.duration || 'Not specified'}</p>
            </div>
          </div>

          {therapyPlan.additionalNotes && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Additional Notes</h2>
              <p className="text-gray-600">{therapyPlan.additionalNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientTherapyPlan;