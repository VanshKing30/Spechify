import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  ClipboardList, 
  RefreshCw, 
  AlertTriangle, 
  Check,
  Plus,
  X 
} from "lucide-react";

export const TherapySessionsCalendar = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sessionObjective: "",
    warmUpActivity: "",
    coreTherapyActivity: "",
    reviewFeedback: "",
    homeAssignment: "",
  });
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = auth.currentUser;
        if (!user) {
          setError("No therapist is logged in.");
          return;
        }

        const therapistDocRef = doc(db, "users", user.uid);
        const therapistDoc = await getDoc(therapistDocRef);

        if (!therapistDoc.exists()) {
          setError("Therapist data not found.");
          return;
        }

        const therapistData = therapistDoc.data();
        const currentPatients = therapistData.currentPatients || [];

        if (currentPatients.length === 0) {
          setPatients([]);
          return;
        }

        const usersCollectionRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollectionRef);

        const patientsList = [];
        usersSnapshot.forEach((doc) => {
          if (currentPatients.includes(doc.id)) {
            patientsList.push({
              id: doc.id,
              name: doc.data().name || "No Name",
              progress: doc.data().progress || 0,
            });
          }
        });

        setPatients(patientsList);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patients. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleCreateSession = (patientId) => {
    setSelectedPatientId(patientId);
    setShowForm(true);
  };

  const handleSubmitSession = async () => {
    if (!selectedPatientId) return;

    const roomId = uuidv4();
    const sessionData = {
      ...formData,
      therapistId: auth.currentUser.uid,
      patientId: selectedPatientId,
      roomId,
      createdAt: new Date(),
    };

    try {
      // Create a session in the database
      await setDoc(doc(db, "sessions", roomId), sessionData);

      // Update patient progress
      const patientDocRef = doc(db, "users", selectedPatientId);
      const patientDoc = await getDoc(patientDocRef);
      const currentProgress = patientDoc.data().progress || 0;

      await updateDoc(patientDocRef, { progress: currentProgress + 1 });

      setShowForm(false);
      setFormData({
        sessionObjective: "",
        warmUpActivity: "",
        coreTherapyActivity: "",
        reviewFeedback: "",
        homeAssignment: "",
      });
    } catch (err) {
      console.error("Error submitting session:", err);
      setError("Failed to create session. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <Users className="mr-4 text-blue-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Therapist's Patient Management</h1>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <span className="ml-3 text-gray-600">Loading patients...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center mb-4">
          <AlertTriangle className="text-red-500 mr-3" size={24} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <UserPlus className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No patients allocated yet.</p>
        </div>
      )}

      <div className="grid md:grid-cols-1 gap-6">
        {patients.map((patient) => (
          <div 
            key={patient.id} 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100 flex flex-col md:flex-row items-center"
          >
            <div className="flex-grow mb-4 md:mb-0 md:mr-6 text-center md:text-left">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Calendar className="mr-2 text-blue-500" size={20} />
                {patient.name}
              </h2>
            </div>

            <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mx-4">
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-4 bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${(patient.progress / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center md:text-left">
                Progress: {patient.progress}/10
              </p>
            </div>

            <button
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
              onClick={() => handleCreateSession(patient.id)}
            >
              <Plus className="mr-2" size={20} />
              Create Session
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-gray-700 bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <ClipboardList className="mr-3 text-blue-500" size={24} />
                Session Details
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-4">
              {[
                { key: 'sessionObjective', placeholder: 'Session Objective' },
                { key: 'warmUpActivity', placeholder: 'Warm-up Activity' },
                { key: 'coreTherapyActivity', placeholder: 'Core Therapy Activity' },
                { key: 'reviewFeedback', placeholder: 'Review and Feedback' },
                { key: 'homeAssignment', placeholder: 'Home Assignment' }
              ].map((field) => (
                <input
                  key={field.key}
                  type="text"
                  placeholder={field.placeholder}
                  value={formData[field.key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />
              ))}

              <button
                type="button"
                onClick={handleSubmitSession}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
              >
                <Check className="mr-2" size={20} />
                Submit Session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapySessionsCalendar;