import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

// Set up moment as the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

export const TherapySessionsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [filterPatient, setFilterPatient] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch therapy sessions from Firestore
  useEffect(() => {
    const fetchSessions = async () => {
      const querySnapshot = await getDocs(collection(db, "therapySessions"));
      const sessions = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        start: new Date(doc.data().start.toDate()),
        end: new Date(doc.data().end.toDate()),
        id: doc.id,
      }));
      setEvents(sessions);
    };

    fetchSessions();
  }, []);

  // Fetch patients allocated to the therapist
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }

        // Fetch therapist document to get current patients
        const therapistDocRef = doc(db, 'users', user.uid);
        const therapistDoc = await getDocs(therapistDocRef);
        console.log('therapsitdcos' ,therapistDoc);

        if (therapistDoc.exists()) {
          const therapistData = therapistDoc.data();
          const currentPatients = therapistData.currentPatients || [];
          console.log('curretPatient: ' ,currentPatients);
          if (currentPatients.length > 0) {
            const usersCollectionRef = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollectionRef);

            const patientsList = [];
            usersSnapshot.forEach((doc) => {
              if (currentPatients.includes(doc.id)) {
                patientsList.push({
                  id: doc.id,
                  name: doc.data().name || 'No Name',
                  tags: doc.data().tags || [],
                });
              }
            });
            setPatients(patientsList);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter therapy sessions by patient name
  const filteredEvents = filterPatient
    ? events.filter((event) =>
        event.patientName.toLowerCase().includes(filterPatient.toLowerCase())
      )
    : events;

  // Handle slot selection to open patient selection modal
  const handleSelectSlot = (slotInfo) => {
    setSelectedDateTime(slotInfo.start);
    setShowPatientModal(true);
  };

  // Handle patient selection and navigate to session creation
  const handlePatientSelection = () => {
    if (selectedPatient) {
      // Navigate to session creation page with selected patient and date
      navigate('/create-session', { 
        state: { 
          patientId: selectedPatient, 
          sessionDateTime: selectedDateTime 
        } 
      });
      setShowPatientModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4">Therapy Sessions</h1>

      {/* Patient Filter */}
      <input
        type="text"
        className="border p-2 rounded w-full mb-4"
        placeholder="Filter by Patient Name"
        value={filterPatient}
        onChange={(e) => setFilterPatient(e.target.value)}
      />

      {/* React Big Calendar */}
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="patientName"
        style={{ height: 500 }}
        popup
        defaultView="week"
        views={["month", "week", "day"]}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => {
          alert(`
            Patient: ${event.patientName}
            Therapist: ${event.therapistName}
            Start: ${moment(event.start).format("MMMM Do YYYY, h:mm a")}
            End: ${moment(event.end).format("MMMM Do YYYY, h:mm a")}
            Notes: ${event.sessionNotes || "No notes available"}
          `);
        }}
      />

      {/* Patient Selection Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Select Patient for Session</h2>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="">Select a Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            <div className="flex justify-between">
              <button
                onClick={() => setShowPatientModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePatientSelection}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={!selectedPatient}
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapySessionsCalendar;