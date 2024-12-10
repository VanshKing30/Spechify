import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { io } from 'socket.io-client';

const TherapistChat = () => {
  const { patientId } = useParams(); // Patient ID from URL
  const [patient, setPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = io('http://localhost:5000'); // Ensure the server is running

  useEffect(() => {
    // Fetch patient details
    const fetchPatient = async () => {
      try {
        const patientDoc = await getDoc(doc(db, 'patients', patientId));
        if (patientDoc.exists()) {
          setPatient(patientDoc.data());
        } else {
          console.error('Patient not found');
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      }
    };

    // Listen for messages
    const unsubscribe = onSnapshot(
      collection(db, 'chats', `${patientId}`, 'messages'),
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => doc.data());
        setMessages(fetchedMessages);
      }
    );

    fetchPatient();

    return () => {
      socket.disconnect();
      unsubscribe();
    };
  }, [patientId]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        text: newMessage,
        sender: 'Therapist',
        timestamp: new Date(),
      };
      try {
        await addDoc(collection(db, 'chats', `${patientId}`, 'messages'), message);
        socket.emit('send_message', message);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div>
      <h2>Chat with {patient?.name || 'Patient'}</h2>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <strong>{message.sender}: </strong>
            {message.text}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default TherapistChat;
