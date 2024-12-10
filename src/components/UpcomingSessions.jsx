import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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
    <div className="upcoming-sessions p-4">
      <h1 className="text-2xl font-bold mb-4">Upcoming Sessions</h1>
      {loading && <p>Loading sessions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && sessions.length === 0 && <p>No upcoming sessions found.</p>}
      <ul className="space-y-4">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="p-4 bg-white rounded-lg shadow-md"
          >
            <p className="font-semibold">Session Objective: {session.sessionObjective}</p>
            <p>Warm-up Activity: {session.warmUpActivity}</p>
            <p>Core Therapy Activity: {session.coreTherapyActivity}</p>
            <p>Review and Feedback: {session.reviewFeedback}</p>
            <p>Home Assignment: {session.homeAssignment}</p>
            <p className="text-sm text-gray-500">Created at: {session.createdAt?.toDate().toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingSessions;
