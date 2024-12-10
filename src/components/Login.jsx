// src/components/Login.js
import React, { useState } from 'react';
import { loginUser, signInWithGoogle, getUserRole } from '../authService';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // Import Firestore
import { doc, getDoc } from 'firebase/firestore'; // Import getDoc and doc

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const checkQuestionnaireCompletion = async (userId) => {
    try {
      // Fetching the user document from Firestore
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        console.log('User document:', userDoc.data()); // Log the user document to check if data is fetched correctly
        return userDoc.data().questionnaireCompleted || false;
      } else {
        console.log('User document not found');
        return false;
      }
    } catch (error) {
      console.error('Error checking questionnaire completion:', error);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password);
      const role = await getUserRole(user.uid);

      console.log('Logged in user:', user); // Log user object for debugging
      console.log('User role:', role); // Log role for debugging

      if (role === 'patient') {
        const questionnaireCompleted = await checkQuestionnaireCompletion(user.uid);
        console.log('Questionnaire Completed:', questionnaireCompleted); // Log to verify the flag

        if (questionnaireCompleted) {
          navigate('/patient-dashboard');
        } else {
          navigate('/questionnaire');
        }
      } else if (role === 'therapist') {
        navigate('/therapist-dashboard');
      } else if (role === 'supervisor') {
        navigate('/supervisor-dashboard');
      }
    } catch (error) {
      alert('Error logging in:', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      const role = await getUserRole(user.uid);

      console.log('Logged in user via Google:', user); // Log user object for debugging
      console.log('User role via Google:', role); // Log role for debugging

      if (role === 'patient') {
        const questionnaireCompleted = await checkQuestionnaireCompletion(user.uid);
        console.log('Questionnaire Completed:', questionnaireCompleted); // Log to verify the flag

        if (questionnaireCompleted) {
          navigate('/patient-dashboard');
        } else {
          navigate('/questionnaire');
        }
      } else if (role === 'therapist') {
        navigate('/therapist-dashboard');
      } else if (role === 'supervisor') {
        navigate('/supervisor-dashboard');
      }
    } catch (error) {
      alert('Error with Google Sign-In:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-600 transition duration-300"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-500 text-white py-2 rounded-md font-semibold hover:bg-red-600 transition duration-300"
          >
            Sign in with Google
          </button>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-indigo-500 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
