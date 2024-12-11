import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { 
  CalendarCheck, 
  Clock, 
  ClipboardList, 
  Home, 
  RefreshCw, 
  AlertTriangle 
} from "lucide-react";

const SessionCard = ({ session }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <CalendarCheck className="text-blue-500 mr-3" size={24} />
        <h3 className="text-xl font-semibold text-gray-800">Therapy Session Details</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <ClipboardList className="text-green-500 mr-2" size={20} />
          <span className="font-medium text-gray-700">Objective:</span>
          <span className="ml-2 text-gray-600">{session.sessionObjective}</span>
        </div>
        
        <div className="flex items-center">
          <RefreshCw className="text-purple-500 mr-2" size={20} />
          <span className="font-medium text-gray-700">Warm-up:</span>
          <span className="ml-2 text-gray-600">{session.warmUpActivity}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="text-orange-500 mr-2" size={20} />
          <span className="font-medium text-gray-700">Core Activity:</span>
          <span className="ml-2 text-gray-600">{session.coreTherapyActivity}</span>
        </div>
        
        <div className="flex items-center">
          <Home className="text-teal-500 mr-2" size={20} />
          <span className="font-medium text-gray-700">Home Assignment:</span>
          <span className="ml-2 text-gray-600">{session.homeAssignment}</span>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
        <span>Created: {session.createdAt?.toDate().toLocaleString()}</span>
      </div>
    </div>
  );
};

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = auth.currentUser;
        if (!user) {
          setError("No patient is logged in.");
          return;
        }

        const sessionsRef = collection(db, "sessions");
        const q = query(sessionsRef, where("patientId", "==", user.uid));
        const snapshot = await getDocs(q);

        const sessionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSessions(sessionsList);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to load sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <CalendarCheck className="mr-3 text-blue-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Upcoming Therapy Sessions</h1>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <span className="ml-3 text-gray-600">Loading sessions...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="text-red-500 mr-3" size={24} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <CalendarCheck className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No upcoming sessions found.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default UpcomingSessions;