import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

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
    <div className="therapy-sessions-calendar p-4">
      <h1 className="text-2xl font-bold mb-4">Therapist's Patients</h1>
      {loading && <p>Loading patients...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && patients.length === 0 && <p>No patients allocated yet.</p>}
      <ul className="space-y-4">
        {patients.map((patient) => (
          <li
            key={patient.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
          >
            <div>
              <p className="text-lg font-semibold">{patient.name}</p>
            </div>
            <div className="w-2/3 mx-4">
              <div className="relative h-4 bg-gray-200 rounded-full">
                <div
                  className="absolute top-0 left-0 h-4 bg-blue-500 rounded-full"
                  style={{ width: `${(patient.progress / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Progress: {patient.progress}/10
              </p>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              onClick={() => handleCreateSession(patient.id)}
            >
              Create Session
            </button>
          </li>
        ))}
      </ul>
      {showForm && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Session Details</h2>
            <form>
              <input
                type="text"
                placeholder="Session Objective"
                value={formData.sessionObjective}
                onChange={(e) =>
                  setFormData({ ...formData, sessionObjective: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Warm-up Activity"
                value={formData.warmUpActivity}
                onChange={(e) =>
                  setFormData({ ...formData, warmUpActivity: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Core Therapy Activity"
                value={formData.coreTherapyActivity}
                onChange={(e) =>
                  setFormData({ ...formData, coreTherapyActivity: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Review and Feedback"
                value={formData.reviewFeedback}
                onChange={(e) =>
                  setFormData({ ...formData, reviewFeedback: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Home Assignment"
                value={formData.homeAssignment}
                onChange={(e) =>
                  setFormData({ ...formData, homeAssignment: e.target.value })
                }
                className="w-full mb-4 p-2 border rounded"
              />
              <button
                type="button"
                onClick={handleSubmitSession}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapySessionsCalendar;
