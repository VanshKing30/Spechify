// src/components/SignUp.js
import React, { useState } from 'react';
import { registerUser, signInWithGoogle, getUserRole } from '../authService';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const user = await registerUser(email, password, role);

      if (role === 'patient') navigate('/questionnaire'); // Fixed typo here
      else if (role === 'therapist') navigate('/therapist-setup');
      else if (role === 'supervisor') navigate('/supervisor-info'); // Redirecting to supervisor-info
    } catch (error) {
      alert('Error registering user:', error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const user = await signInWithGoogle();
      const role = await getUserRole(user.uid);

      if (role === 'patient') navigate('/questionnaire'); // Fixed typo here
      else if (role === 'therapist') navigate('/therapist-setup');
      else if (role === 'supervisor') navigate('/supervisor-info'); // Redirecting to supervisor-info
    } catch (error) {
      alert('Error with Google Sign-Up:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Sign Up</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="patient">Patient</option>
            <option value="therapist">Therapist</option>
            <option value="supervisor">Supervisor</option>
          </select>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={handleGoogleSignUp}
            className="w-full bg-red-500 text-white py-2 rounded-md font-semibold hover:bg-red-600 transition duration-300"
          >
            Sign up with Google
          </button>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
