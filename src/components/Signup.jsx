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

      if (role === 'patient') navigate('/questionnaire');
      else if (role === 'therapist') navigate('/therapist-setup');
      else if (role === 'supervisor') navigate('/supervisor-info');
    } catch (error) {
      alert('Error registering user: ' + error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const user = await signInWithGoogle();
      const role = await getUserRole(user.uid);

      if (role === 'patient') navigate('/questionnaire');
      else if (role === 'therapist') navigate('/therapist-setup');
      else if (role === 'supervisor') navigate('/supervisor-info');
    } catch (error) {
      alert('Error with Google Sign-Up: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 p-4 relative overflow-hidden">
      {/* Geometric Shapes */}
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

        {/* Additional Shapes Around Signup Window */}
        <div className="absolute top-1/2 -left-20 transform -translate-y-1/2 rotate-45 
            w-40 h-40 bg-sky-100/30 z-0"></div>
        
        <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 -rotate-45 
            w-40 h-40 bg-sky-100/30 z-0"></div>
        
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 rotate-12 
            w-60 h-20 bg-sky-200/20 z-0"></div>
        
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 -rotate-12 
            w-60 h-20 bg-sky-200/20 z-0"></div>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md z-10 relative">
        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden 
            border border-sky-100 relative">
          <div className="p-8 relative z-20">
            <h2 className="text-3xl font-bold text-center text-sky-800 mb-6">Sign Up</h2>
            
            <form onSubmit={handleSignUp} className="space-y-6">
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
              </div>

              <div>
                <label className="block text-sky-700 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-sky-50 border border-sky-200 
                             focus:outline-none focus:ring-2 focus:ring-sky-400 text-sky-800"
                >
                  <option value="patient">Patient</option>
                  <option value="therapist">Therapist</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-3 rounded-xl 
                           hover:bg-sky-700 transition duration-300 
                           ease-in-out transform hover:scale-105 shadow-md"
              >
                Sign Up
              </button>
            </form>
            
            <div className="my-6 flex items-center justify-center space-x-4">
              <div className="h-px bg-sky-200 w-full"></div>
              <span className="text-sky-600">or</span>
              <div className="h-px bg-sky-200 w-full"></div>
            </div>
            
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center bg-white 
                         border border-sky-200 text-sky-700 py-3 rounded-xl 
                         hover:bg-sky-50 transition duration-300 
                         ease-in-out transform hover:scale-105 shadow-md"
            >
              Continue with Google
            </button>
            
            <p className="text-center text-sky-700 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-600 hover:underline font-semibold">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;