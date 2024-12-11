import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  BarChart2, 
  Settings, 
  MessageCircle, 
  CheckCircle, 
  Loader2, 
  Users, 
  Edit2, 
  PlusCircle 
} from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { TherapySessionsCalendar } from '../components/TherapySessionsCalendar';

const TherapistDashboard = () => {
  const [therapistData, setTherapistData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [therapyPlanData, setTherapyPlanData] = useState({
    goals: '',
    techniques: [],
    sessionFrequency: '',
    duration: '',
    additionalNotes: '',
    approvalStatus: 'pending',
    supervisorId: null,
  });

  // Existing useEffect and data fetching logic remains the same
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in');
      return;
    }

    const fetchData = async () => {
      try {
        const therapistDocRef = doc(db, 'users', user.uid);
        const therapistDoc = await getDoc(therapistDocRef);

        if (therapistDoc.exists()) {
          const therapistData = therapistDoc.data();
          setTherapistData(therapistData);

          const currentPatients = therapistData.currentPatients || [];
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
                  therapyPlan: doc.data().therapyPlan || null,
                });
              }
            });
            setPatients(patientsList);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateOrUpdatePlan = async (patientId) => {
    try {
      const therapistDocRef = doc(db, 'users', auth.currentUser.uid);
      const therapistDoc = await getDoc(therapistDocRef);
  
      if (!therapistDoc.exists()) {
        throw new Error('Therapist document not found');
      }
  
      const supervisor = therapistDoc.data().supervisor; // Access the entire supervisor map
      const supervisorId = supervisor?.id; // Safely access the 'id' field
      

  
      if (!supervisorId) {
        alert('No supervisor assigned. Please contact admin.');
        return;
      }
  
      const therapyPlan = {
        ...therapyPlanData,
        supervisorId: supervisorId,
        patientId: patientId,
        status: 'pending', // Status for approval
        createdAt: new Date(),
      };
  
      // Save the therapy plan in Firestore under a dedicated collection for approval
      const approvalRef = collection(db, 'therapy_plan_approvals');
      await setDoc(doc(approvalRef), therapyPlan);
  
      alert('Therapy plan sent to supervisor for approval!');
      setSelectedPatient(null); // Close the form after submission
      setTherapyPlanData({
        goals: '',
        techniques: [],
        sessionFrequency: '',
        duration: '',
        additionalNotes: '',
        approvalStatus: 'pending',
        supervisorId: null,
      });
    } catch (error) {
      console.error('Error submitting therapy plan:', error);
    }
  };
  

  const handleCheckboxChange = (e, value) => {
    const checked = e.target.checked;
    if (checked) {
      setTherapyPlanData({
        ...therapyPlanData,
        techniques: [...therapyPlanData.techniques, value],
      });
    } else {
      setTherapyPlanData({
        ...therapyPlanData,
        techniques: therapyPlanData.techniques.filter((technique) => technique !== value),
      });
    }
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
  const NavigationSidebar = () => {
    const navItems = [
      { section: 'dashboard', label: 'Dashboard', icon: Home },
      { section: 'therapy-sessions', label: 'Therapy Sessions', icon: Calendar },
      { section: 'progress-reports', label: 'Progress Reports', icon: BarChart2 },
      { section: 'settings', label: 'Settings', icon: Settings },
      { section: 'chat', label: 'Chat', icon: MessageCircle },
      ...(therapistData?.role === 'supervisor'
        ? [{ section: 'supervisor-dashboard', label: 'Supervisor Dashboard', icon: CheckCircle }]
        : []),
    ];

    return (
      <div className="w-64 bg-indigo-900 text-white h-screen fixed left-0 top-0 overflow-y-auto shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Users className="mr-2 text-indigo-300" /> Therapist Portal
          </h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.section}
                  onClick={() => setActiveSection(item.section)}
                  className={`w-full flex items-center text-left py-3 px-4 rounded transition duration-200 ${
                    activeSection === item.section
                      ? 'bg-indigo-700 text-white'
                      : 'hover:bg-indigo-700 text-gray-200'
                  }`}
                >
                  <IconComponent className="mr-3 w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="mr-2 text-indigo-600" /> Patient List
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapy Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patient.therapyPlan 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {patient.therapyPlan ? 'Plan Available' : 'No Plan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        {patient.therapyPlan ? <Edit2 className="mr-1 w-4 h-4" /> : <PlusCircle className="mr-1 w-4 h-4" />}
                        {patient.therapyPlan ? 'Edit Therapy Plan' : 'Create Therapy Plan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedPatient && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Edit2 className="mr-2 text-indigo-600" />
              {selectedPatient.therapyPlan ? 'Edit' : 'Create'} Therapy Plan for {selectedPatient.name}
            </h2>
            {/* Existing therapy plan form with improved Tailwind styling */}
            <form onSubmit={(e) => { e.preventDefault(); handleCreateOrUpdatePlan(selectedPatient.id); }}>
              {/* Form fields with enhanced Tailwind classes */}
              {/* ... (keep the existing form fields with improved Tailwind CSS) */}
            </form> <div className="mb-4">
                <label className="block text-gray-700">Goals:</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="3"
                  value={therapyPlanData.goals}
                  onChange={(e) => setTherapyPlanData({ ...therapyPlanData, goals: e.target.value })}
                />
                
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Techniques:</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="3"
                  value={therapyPlanData.techniques}
                  onChange={(e) => setTherapyPlanData({ ...therapyPlanData, techniques: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Session Frequency:</label>
                <select
  className="w-full border border-gray-300 rounded-md p-2"
  value={therapyPlanData.sessionFrequency}
  onChange={(e) => setTherapyPlanData({ ...therapyPlanData, sessionFrequency: e.target.value })}
>
  <option value="" disabled>Select Session Frequency</option>
  <option value="Daily">Daily</option>
  <option value="Weekly">Weekly</option>
  <option value="Bi-Weekly">Bi-Weekly</option>
  <option value="Monthly">Monthly</option>
</select>

              </div>
              <div>
  <label className="font-semibold">Therapy Approach: Techniques and Tools Needed</label>
  <div className="space-y-2 mt-2">
    <label className="block">
      <input
        type="checkbox"
        className="mr-2"
        value="Speech Articulation"
        checked={therapyPlanData.techniques.includes("Speech Articulation")}
        onChange={(e) => handleCheckboxChange(e, "Speech Articulation")}
      />
      Speech Articulation
    </label>

    <label className="block">
      <input
        type="checkbox"
        className="mr-2"
        value="Language Comprehension"
        checked={therapyPlanData.techniques.includes("Language Comprehension")}
        onChange={(e) => handleCheckboxChange(e, "Language Comprehension")}
      />
      Language Comprehension
    </label>

    <label className="block">
      <input
        type="checkbox"
        className="mr-2"
        value="Fluency Training"
        checked={therapyPlanData.techniques.includes("Fluency Training")}
        onChange={(e) => handleCheckboxChange(e, "Fluency Training")}
      />
      Fluency Training
    </label>

    <label className="block">
      <input
        type="checkbox"
        className="mr-2"
        value="AAC (Augmentative and Alternative Communication)"
        checked={therapyPlanData.techniques.includes("AAC (Augmentative and Alternative Communication)")}
        onChange={(e) => handleCheckboxChange(e, "AAC (Augmentative and Alternative Communication)")}
      />
      AAC (Augmentative and Alternative Communication)
    </label>

    <label className="block">
      <input
        type="checkbox"
        className="mr-2"
        value="Voice Therapy"
        checked={therapyPlanData.techniques.includes("Voice Therapy")}
        onChange={(e) => handleCheckboxChange(e, "Voice Therapy")}
      />
      Voice Therapy
    </label>

    {/* Add more techniques/tools as needed */}
  </div>
</div>
<div className="mb-4">
                <label className="block text-gray-700">Additional Notes:</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="3"
                  value={therapyPlanData.additionalNotes}
                  onChange={(e) => setTherapyPlanData({ ...therapyPlanData, additionalNotes: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Save Therapy Plan
              </button>
          </div>
        )}
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto h-12 w-12 text-indigo-600" />
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return renderLoadingState();

    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'therapy-sessions':
        return (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <TherapySessionsCalendar />
          </div>
        );
      // Other sections remain similar...
      case 'progress-reports':
        return (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Progress Reports</h2>
            <p>Generate and view patient progress reports.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p>Manage your account and application settings.</p>
          </div>
        );
        case 'supervisor-approval':
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Therapy Plans</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="px-4 py-2">Patient Name</th>
            <th className="px-4 py-2">Goals</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvalList.map((plan) => (
            <tr key={plan.id}>
              <td className="px-4 py-2">{plan.patientName}</td>
              <td className="px-4 py-2">{plan.goals}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => handleApproval(plan.id, true)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                  onClick={() => handleApproval(plan.id, false)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  case 'chat':
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <TherapistChat/>
      </div>
    );


      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <NavigationSidebar />
      <main className="ml-64 p-8 w-full">{renderContent()}</main>
    </div>
  );
};

export default TherapistDashboard;