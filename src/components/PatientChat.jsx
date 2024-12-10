import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Backend URL

export const PatientChat = ({ therapistId, patientId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const roomId = `${therapistId}-${patientId}`; // Unique Room ID
    socket.emit('joinRoom', { roomId, userType: 'patient' });

    socket.on('receiveMessage', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [therapistId, patientId]);

  const sendMessage = () => {
    if (message.trim()) {
      const roomId = `${therapistId}-${patientId}`;
      socket.emit('sendMessage', { roomId, message, sender: 'patient' });
      setMessages((prev) => [...prev, { message, sender: 'patient' }]);
      setMessage('');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Chat with Therapist</h2>
      <div className="chat-box bg-gray-100 p-4 rounded h-96 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              msg.sender === 'patient' ? 'bg-blue-200 text-right' : 'bg-gray-300 text-left'
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-grow border rounded p-2"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};
