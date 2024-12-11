import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import TherapistListing from '../components/TherapistListing';

const SupervisorDashboard = () => {
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [updatedContent, setUpdatedContent] = useState('');
  const [view, setView] = useState('approvals'); // Manage different views

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansCollectionRef = collection(db, 'therapy_plan_approvals');
        const plansSnapshot = await getDocs(plansCollectionRef);
        const plansList = [];
        plansSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.supervisorId === auth.currentUser?.uid) {
            plansList.push({ id: doc.id, ...data });
          }
        });
        setTherapyPlans(plansList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching therapy plans:', error);
        setLoading(false);
      }
    };

    const fetchReports = async () => {
      try {
        const reportsCollectionRef = collection(db, 'progress_report_approvals');
        const reportsSnapshot = await getDocs(reportsCollectionRef);
        const reportsList = [];
        reportsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.supervisorId === auth.currentUser?.uid) {
            reportsList.push({ id: doc.id, ...data });
          }
        });
        setProgressReports(reportsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching progress reports:', error);
        setLoading(false);
      }
    };

    if (view === 'approvals') {
      fetchPlans();
    } else if (view === 'progressReports') {
      fetchReports();
    }
  }, [view]);

  const handleApproval = async (itemId, status, collectionName) => {
    try {
      const itemRef = doc(db, collectionName, itemId);
      await updateDoc(itemRef, { status });

      if (collectionName === 'therapy_plan_approvals') {
        setTherapyPlans((prev) =>
          prev.map((plan) => (plan.id === itemId ? { ...plan, status } : plan))
        );
      } else if (collectionName === 'progress_report_approvals') {
        setProgressReports((prev) =>
          prev.map((report) => (report.id === itemId ? { ...report, status } : report))
        );
      }

      alert(`${collectionName.replace('_', ' ')} ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error(`Error updating ${collectionName} status:`, error);
    }
  };

  if (loading && (view === 'approvals' || view === 'progressReports')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Supervisor Dashboard</h2>
        <nav>
          <ul>
            <li className="mb-4">
              <button
                className={`text-gray-700 hover:text-indigo-600 font-medium ${view === 'approvals' && 'text-indigo-600'}`}
                onClick={() => setView('approvals')}
              >
                Pending Approvals
              </button>
            </li>
            <li className="mb-4">
              <button
                className={`text-gray-700 hover:text-indigo-600 font-medium ${view === 'progressReports' && 'text-indigo-600'}`}
                onClick={() => setView('progressReports')}
              >
                Progress Report Approval
              </button>
            </li>
            <li className="mb-4">
              <button
                className={`text-gray-700 hover:text-indigo-600 font-medium ${view === 'therapistListing' && 'text-indigo-600'}`}
                onClick={() => setView('therapistListing')}
              >
                Therapist Listing
              </button>
            </li>
            <li className="mb-4">
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {view === 'approvals' && (
          <>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Pending Approvals</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              {therapyPlans.length > 0 ? (
                therapyPlans.map((plan) => (
                  <div key={plan.id} className="border-b border-gray-200 py-4">
                    <h2 className="font-semibold text-lg">{`Therapist ID: ${plan.therapistId}`}</h2>
                    <p className="text-gray-600">{`Patient ID: ${plan.patientId}`}</p>
                    <p className="text-gray-600">{`Content: ${plan.content || 'No content available'}`}</p>
                    <p className="text-gray-600">{`Status: ${plan.status}`}</p>
                    <p className="text-gray-600">{`Goals: ${plan.goals}`}</p>
                    <p className="text-gray-600">{`Techniques: ${plan.techniques}`}</p>
                    <div className="mt-4">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                        onClick={() => handleApproval(plan.id, 'approved', 'therapy_plan_approvals')}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                        onClick={() => handleApproval(plan.id, 'rejected', 'therapy_plan_approvals')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No therapy plans pending approval.</p>
              )}
            </div>
          </>
        )}
        {view === 'progressReports' && (
          <>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Progress Report Approvals</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              {progressReports.length > 0 ? (
                progressReports.map((report) => (
                  <div key={report.id} className="border-b border-gray-200 py-4">
                    <h2 className="font-semibold text-lg">{`Report ID: ${report.id}`}</h2>
                    <p className="text-gray-600">{`Therapist ID: ${report.therapistId}`}</p>
                    <p className="text-gray-600">{`Patient ID: ${report.patientId}`}</p>
                    <p className="text-gray-600">{`Content: ${report.content || 'No content available'}`}</p>
                    <p className="text-gray-600">{`Status: ${report.status}`}</p>
                    <div className="mt-4">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                        onClick={() => handleApproval(report.id, 'approved', 'progress_report_approvals')}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                        onClick={() => handleApproval(report.id, 'rejected', 'progress_report_approvals')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No progress reports pending approval.</p>
              )}
            </div>
          </>
        )}
        {view === 'therapistListing' && <TherapistListing />}
      </div>
    </div>
  );
};

export default SupervisorDashboard;