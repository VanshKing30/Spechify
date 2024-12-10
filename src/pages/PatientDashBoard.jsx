import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Home, Calendar, Settings, User } from 'lucide-react';
import AllocationStatus from '../components/AllocationStatus';
import PatientTherapyPlan from '../components/PatientTherapyPlan';
// import { PatientChat } from '../components/PatientChat';

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', tab: 'dashboard' },
    { icon: Calendar, label: 'Therapy Plan', tab: 'therapyPlan' },
    { icon: Calendar, label: 'Upcoming Sessions', tab: 'upcomingSessions' },
    { icon: Settings, label: 'Settings', tab: 'settings' },
    { icon : User , label : 'Chat' , tab : 'chat'}
  ];

  return (
    <div className="w-64 bg-white border-r h-screen fixed left-0 top-0 pt-20">
      <div className="p-4">
        {menuItems.map((item) => (
          <div 
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`
              flex items-center p-3 mb-2 cursor-pointer rounded-lg
              ${activeTab === item.tab ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}
            `}
          >
            <item.icon className="mr-3" size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Navbar Component
const TopNavbar = ({ patientName, patientAvatar }) => {
  return (
    <div className="fixed top-0 left-64 right-0 bg-white shadow-sm h-16 flex items-center px-6 z-10">
      <div className="flex items-center">
        <img 
          src={patientAvatar || '/default-avatar.png'} 
          alt="Patient Avatar" 
          className="w-10 h-10 rounded-full mr-3"
        />
        <h2 className="text-xl font-semibold text-gray-800">
          {patientName || 'Patient Dashboard'}
        </h2>
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      console.log("No user is logged in.");
      setLoading(false);
      setError("User not logged in.");
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPatientData(data);

          if (data.assignedTherapist) {
            try {
              const therapistDoc = await getDoc(doc(db, 'users', data.assignedTherapist));
              if (therapistDoc.exists()) {
                setTherapist(therapistDoc.data());
              } else {
                setError("Therapist data not found.");
              }
            } catch (err) {
              console.error("Error fetching therapist data:", err);
              setError("Error fetching therapist data.");
            }
          }
        } else {
          setError("Patient data not found.");
        }

        setLoading(false);
      },
      (err) => {
        console.error("Error fetching patient data:", err);
        setError("Error fetching patient data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getWaitingTime = () => {
    if (!patientData?.createdAt) return null;
    const waitingTime = Date.now() - new Date(patientData.createdAt).getTime();
    const days = Math.floor(waitingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((waitingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} days ${hours} hours`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <TopNavbar 
        patientName={patientData?.name} 
        patientAvatar={patientData?.avatarUrl} 
      />
      
      <main className="ml-64 mt-16 w-full p-6">
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <AllocationStatus 
                  status={therapist ? 'allocated' : 'waiting'} 
                  therapist={therapist} 
                  waitingTime={getWaitingTime()} 
                />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Identified Conditions:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {patientData?.tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {therapist && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Therapist</h2>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">{therapist.name}</h3>
                      <div className="space-y-3">
                        <p className="text-gray-600">Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {therapist.specialties?.map(specialty => (
                            <span key={specialty} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'therapyPlan' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Therapy Plan</h1>
            <PatientTherapyPlan/>
          </div>
        )}

        {activeTab === 'upcomingSessions' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Upcoming Sessions</h1>
            {/* Add upcoming sessions content */}
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Chat</h1>
            <PatientChat/>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>
            {/* Add settings content */}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;