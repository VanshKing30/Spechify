import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AllocationStatus = ({ status, therapist, waitingTime }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'allocated':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          text: 'Allocated',
          color: 'bg-green-100 text-green-800'
        };
      case 'waiting':
        return {
          icon: <Clock className="w-6 h-6 text-yellow-500" />,
          text: 'Waiting for Allocation',
          color: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          text: 'Not Allocated',
          color: 'bg-red-100 text-red-800'
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Allocation Status</h3>
        {statusInfo.icon}
      </div>
      <div className="space-y-3">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusInfo.color}`}>
          {statusInfo.text}
        </div>
        {status === 'allocated' && therapist && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Assigned Therapist:</p>
            <p className="font-medium text-gray-800">{therapist.name}</p>
          </div>
        )}
        {status === 'waiting' && waitingTime && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Waiting Time:</p>
            <p className="font-medium text-gray-800">{waitingTime}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationStatus;