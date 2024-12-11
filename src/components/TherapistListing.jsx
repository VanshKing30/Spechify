import React, { useEffect, useState } from 'react';
import { 
  Star, 
  MessageCircle, 
  Edit2, 
  Save, 
  X 
} from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion 
} from 'firebase/firestore';

const TherapistListing = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRatings, setEditingRatings] = useState({});
  const [editingComments, setEditingComments] = useState({});

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      try {
        const supervisorRef = doc(db, 'users', auth.currentUser?.uid);
        const supervisorDoc = await getDoc(supervisorRef);

        if (supervisorDoc.exists()) {
          const supervisorData = supervisorDoc.data();
          if (supervisorData.therapists && Array.isArray(supervisorData.therapists)) {
            // Initialize editing states
            const initialEditingRatings = {};
            const initialEditingComments = {};
            supervisorData.therapists.forEach(therapist => {
              initialEditingRatings[therapist.id] = therapist.rating || 0;
              initialEditingComments[therapist.id] = '';
            });
            setEditingRatings(initialEditingRatings);
            setEditingComments(initialEditingComments);
            setTherapists(supervisorData.therapists);
          } else {
            console.error('Therapists data is missing or not in expected format.');
          }
        } else {
          console.error('Supervisor document does not exist.');
        }
      } catch (error) {
        console.error('Error fetching therapists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const handleRatingChange = (therapistId, rating) => {
    setEditingRatings(prev => ({
      ...prev,
      [therapistId]: rating
    }));
  };

  const handleCommentChange = (therapistId, comment) => {
    setEditingComments(prev => ({
      ...prev,
      [therapistId]: comment
    }));
  };

  const saveRatingAndComment = async (therapistId) => {
    try {
      const supervisorRef = doc(db, 'users', auth.currentUser?.uid);
      
      // Update therapists array in supervisor's document
      await updateDoc(supervisorRef, {
        therapists: arrayUnion({
          id: therapistId,
          rating: editingRatings[therapistId],
          comments: editingComments[therapistId]
        })
      });

      // Update local state to reflect changes
      setTherapists(prev => prev.map(therapist => 
        therapist.id === therapistId 
          ? { 
              ...therapist, 
              rating: editingRatings[therapistId],
              comments: editingComments[therapistId]
            } 
          : therapist
      ));

      alert('Rating and comment saved successfully!');
    } catch (error) {
      console.error('Error saving rating and comment:', error);
      alert('Failed to save rating and comment');
    }
  };

  const renderStarRating = (therapistId) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-6 h-6 cursor-pointer ${
          editingRatings[therapistId] >= star 
            ? 'text-yellow-500 fill-current' 
            : 'text-gray-300'
        }`}
        onClick={() => handleRatingChange(therapistId, star)}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading therapists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Therapist Listing</h1>
      {therapists.length > 0 ? (
        <ul className="space-y-4">
          {therapists.map((therapist) => (
            <li 
              key={therapist.id} 
              className="p-4 bg-gray-100 rounded-md shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-700">{therapist.name}</h2>
                  <p className="text-gray-600">ID: {therapist.id}</p>
                </div>
                
                {/* Star Rating Section */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 mr-2">Rating:</span>
                  {renderStarRating(therapist.id)}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <MessageCircle className="w-5 h-5 text-gray-600 mr-2" />
                  <label className="text-sm font-medium text-gray-700">
                    Supervisor Comments
                  </label>
                </div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  value={editingComments[therapist.id] || ''}
                  onChange={(e) => handleCommentChange(therapist.id, e.target.value)}
                  placeholder="Add comments about the therapist..."
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  onClick={() => saveRatingAndComment(therapist.id)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No therapists assigned to this supervisor.</p>
      )}
    </div>
  );
};

export default TherapistListing;