import React, { useState } from 'react';
import { loginUser, signInWithGoogle, getUserRole } from '../authService';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const checkQuestionnaireCompletion = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        console.log('User document:', userDoc.data());
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

      console.log('Logged in user:', user);
      console.log('User role:', role);

      if (role === 'patient') {
        const questionnaireCompleted = await checkQuestionnaireCompletion(user.uid);
        console.log('Questionnaire Completed:', questionnaireCompleted);

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
      alert('Error logging in: ' + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      const role = await getUserRole(user.uid);

      console.log('Logged in user via Google:', user);
      console.log('User role via Google:', role);

      if (role === 'patient') {
        const questionnaireCompleted = await checkQuestionnaireCompletion(user.uid);
        console.log('Questionnaire Completed:', questionnaireCompleted);

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
      alert('Error with Google Sign-In: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 p-4 relative overflow-hidden">
      {/* Solid Geometric Shapes */}
      <div className="absolute pointer-events-none">
        {/* Large Triangle - Bottom Left */}
        <div className="absolute -bottom-40 -left-40 transform rotate-45 
            w-96 h-96 bg-sky-200/30 z-0"></div>

        {/* Rectangle - Top Right */}
        <div className="absolute -top-20 -right-20 transform -rotate-12 
            w-80 h-60 bg-sky-300/20 z-0"></div>

        {/* Small Triangle - Top Left */}
        <div className="absolute top-20 -left-20 transform rotate-45 
            w-60 h-60 bg-sky-100/40 z-0"></div>

        {/* Diagonal Rectangle - Bottom Right */}
        <div className="absolute -bottom-20 -right-20 transform rotate-45 
            w-80 h-40 bg-sky-200/30 z-0"></div>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md z-10 relative">
        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden 
            border border-sky-100 relative">
          <div className="p-8 relative z-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-sky-800">Welcome Back</h2>
              <p className="text-sky-600 mt-2">Speech Therapy Rehabilitation</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sky-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl bg-sky-50 border border-sky-200 
                             focus:outline-none focus:ring-2 focus:ring-sky-400 text-sky-800"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sky-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl bg-sky-50 border border-sky-200 
                             focus:outline-none focus:ring-2 focus:ring-sky-400 text-sky-800"
                  required
                />
                <Link to="/forgot-password" className="text-sky-600 text-sm hover:underline mt-2 block text-right">
                  Forgot Password?
                </Link>
              </div>
              
              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-3 rounded-xl 
                           hover:bg-sky-700 transition duration-300 
                           ease-in-out transform hover:scale-105 shadow-md"
              >
                Login
              </button>
            </form>
            
            <div className="my-6 flex items-center justify-center space-x-4">
              <div className="h-px bg-sky-200 w-full"></div>
              <span className="text-sky-600">or</span>
              <div className="h-px bg-sky-200 w-full"></div>
            </div>
            
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center bg-white 
                         border border-sky-200 text-sky-700 py-3 rounded-xl 
                         hover:bg-sky-50 transition duration-300 
                         ease-in-out transform hover:scale-105 shadow-md"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.2 6.5v5.5h6.8c4-3.7 6.3-9.1 6.3-15.5z"/>
                <path fill="#34A853" d="M24 46c5.7 0 10.4-1.9 13.8-5.2l-6.8-5.3c-1.9 1.3-4.4 2-7 2-5.4 0-10-3.6-11.6-8.6H5.5v5.5C8.9 41.5 16 46 24 46z"/>
                <path fill="#FBBC05" d="M12.4 28.9c-.8-2.3-1.3-4.8-1.3-7.4 0-2.6.5-5.1 1.3-7.4V9H5.5C4 11.8 3.2 15 3.2 18.5s.8 6.7 2.3 9.5l6.9-5.1z"/>
                <path fill="#EA4335" d="M24 9.5c3.1 0 5.8 1.1 8 3.2l6-6C34.4 2.3 29.7 0 24 0 16 0 8.9 4.5 5.5 11.5l6.9 5.1C13.9 13.1 18.6 9.5 24 9.5z"/>
              </svg>
              Continue with Google
            </button>
            
            <p className="text-center text-sky-700 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-sky-600 hover:underline font-semibold">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;