import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const SupervisorDashboard = () => {
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [updatedContent, setUpdatedContent] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansCollectionRef = collection(db, 'therapy_plan_approvals');
        const plansSnapshot = await getDocs(plansCollectionRef);
        const plansList = [];
        plansSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Fetched Plan:', data);
          if (data.supervisorId === auth.currentUser?.uid) {
            plansList.push({ id: doc.id, ...data });
          }
        });
        setTherapyPlans(plansList);
        setLoading(false);
        console.log('Filtered Plans:', plansList);
      } catch (error) {
        console.error('Error fetching therapy plans:', error);
        setLoading(false);
      }
    };
  
    fetchPlans();
  }, []);
  

  const handleApproval = async (planId, status) => {
    try {
      const planRef = doc(db, 'therapy_plan_approvals', planId);
      await updateDoc(planRef, { status });

      setTherapyPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, status } : plan
        )
      );

      alert(`Therapy plan ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating therapy plan status:', error);
    }
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    console.log("myplan" , plan);
    setUpdatedContent(plan.content || '');
  };

  const handleEditSave = async () => {
    try {
      const planRef = doc(db, 'therapy_plan_approvals', editingPlan.id);
      await updateDoc(planRef, { content: updatedContent });

      setTherapyPlans((prev) =>
        prev.map((plan) =>
          plan.id === editingPlan.id ? { ...plan, content: updatedContent } : plan
        )
      );

      setEditingPlan(null);
      alert('Therapy plan updated successfully!');
    } catch (error) {
      console.error('Error updating therapy plan content:', error);
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Supervisor Dashboard</h1>
      <div className="w-3/4 bg-white rounded-lg shadow-md p-6">
        {therapyPlans.length > 0 ? (
          therapyPlans.map((plan) => (
            <div key={plan.id} className="border-b border-gray-200 py-4">
              <h2 className="font-semibold text-lg">{`Therapist ID: ${plan.therapistId}`}</h2>
              <p className="text-gray-600">{`Patient ID: ${plan.patientId}`}</p>
              <p className="text-gray-600">{`Content: ${plan.content || 'No content available'}`}</p>
              <p className="text-gray-600">{`Status: ${plan.status}`}</p>
              <p className="text-gray-600">{`Status: ${plan.goals}`}</p>
              <p className="text-gray-600">{`Techniuqes : ${plan.techniques}`}</p>
              <div className="mt-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleApproval(plan.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleApproval(plan.id, 'rejected')}
                >
                  Reject
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => openEditModal(plan)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No therapy plans pending approval.</p>
        )}
      </div>

      {editingPlan && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-1/2">
            <h2 className="text-xl font-semibold mb-4">Edit Therapy Plan</h2>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows="6"
              value={updatedContent}
              onChange={(e) => setUpdatedContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setEditingPlan(null)}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded"
                onClick={handleEditSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
