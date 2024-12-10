import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const SupervisorInfo = () => {
  const [supervisorName, setSupervisorName] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supervisorName) {
      alert('Please enter your name');
      return;
    }

    try {
      const user = auth.currentUser;

      if (user) {
        // Create or update Firestore document for the supervisor
        const supervisorRef = doc(db, 'users', user.uid);

        // Set the supervisor's info in Firestore
        await setDoc(
          supervisorRef,
          {
            name: supervisorName,
            email: user.email,
            role: 'supervisor', // Explicitly set the role
            createdAt: new Date().toISOString(),
            therapists: [], // Initialize empty therapists array
          },
          { merge: true }
        );

        // Redirect to supervisor dashboard
        navigate('/supervisor-dashboard');
      } else {
        throw new Error('No authenticated user found');
      }
    } catch (error) {
      console.error('Error saving supervisor info:', error);
      alert('Error saving supervisor info: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Welcome Supervisor! Please enter your name.
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={supervisorName}
            onChange={(e) => setSupervisorName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-600 transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupervisorInfo;