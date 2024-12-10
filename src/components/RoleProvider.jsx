// src/components/RoleProvider.js
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const roleDoc = await getDoc(doc(db, 'users', user.uid));
        setRole(roleDoc.data()?.role);
      } else {
        setRole(null);
      }
    });
    return unsubscribe;
  }, []);

  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
};

export const useRole = () => useContext(RoleContext);
