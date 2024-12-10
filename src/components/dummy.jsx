import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const TherapistSetup = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const navigate = useNavigate();

  // Check if setup is already completed
  useEffect(() => {
    const checkSetupStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().setupCompleted) {
          navigate('/therapist-dashboard');
        } else if (userDoc.exists()) {
          // Pre-fill form if data exists
          const data = userDoc.data();
          setName(data.name || '');
          setAge(data.age || '');
          setGender(data.gender || '');
          setSpecialties(data.specialties || []);
        }
      }
    };

    checkSetupStatus();
  }, [navigate]);

  const specialistOptions = [
    'Articulation Disorder Specialist',
    'Language Disorder Specialist',
    'Fluency Disorder Specialist',
    'Social Communication Disorder Specialist',
    'Apraxia Specialist',
    'Dysarthria Specialist',
    'Voice Specialist',
    'AAC Specialist',
    'Early Childhood Language Specialist',
    'Neurogenic Communication Disorder Specialist'
  ];

  // Convert specialty names to tags for matching
  const getSpecialtyTags = (specialty) => {
    const tagMap = {
      'Articulation Disorder Specialist': ['articulation-disorder'],
      'Language Disorder Specialist': ['language-disorder'],
      'Fluency Disorder Specialist': ['stuttering'],
      'Social Communication Disorder Specialist': ['social-communication-disorder'],
      'Apraxia Specialist': ['apraxia-of-speech'],
      'Dysarthria Specialist': ['dysarthria'],
      'Voice Specialist': ['voice-disorder'],
      'AAC Specialist': ['aac'],
      'Early Childhood Language Specialist': ['early-language', 'language-disorder'],
      'Neurogenic Communication Disorder Specialist': ['neurogenic-disorder']
    };
    return tagMap[specialty] || [];
  };

  const handleSpecialtyChange = (specialty) => {
    setSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to complete setup');
        return;
      }

      // Flatten and deduplicate tags from all specialties
      const specialtyTags = [...new Set(
        specialties.flatMap(specialty => getSpecialtyTags(specialty))
      )];

      await setDoc(doc(db, 'users', user.uid), {
        name,
        age,
        gender,
        specialties,
        specialtyTags, // Add tags for matching
        role: 'therapist',
        setupCompleted: true,
        active: true,
        currentPatients: [],
        maxPatients: 3, // Default max patients
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert('Profile saved successfully!');
      navigate('/therapist-dashboard');
    } catch (error) {
      console.error('Error saving profile: ', error);
      alert('Error saving profile. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">Therapist Profile Setup</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            min="18"
            max="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Specialties (Select all that apply)
          </label>
          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
            {specialistOptions.map((specialty) => (
              <div key={specialty} className="flex items-center">
                <input
                  type="checkbox"
                  checked={specialties.includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                  className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-0"
                />
                <label className="text-sm text-gray-700">{specialty}</label>
              </div>
            ))}
          </div>
          {specialties.length === 0 && (
            <p className="text-red-500 text-xs mt-1">Please select at least one specialty</p>
          )}
        </div>

        <button
          type="submit"
          disabled={specialties.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default TherapistSetup;