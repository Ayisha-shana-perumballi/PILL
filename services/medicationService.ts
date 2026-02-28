
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Medication, MedicationStatus } from '../types';

export const addMedication = async (userId: string, medication: Omit<Medication, 'id'>) => {
  try {
    const medsRef = collection(db, 'users', userId, 'medicines');
    const docRef = await addDoc(medsRef, {
      ...medication,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding medication:', error);
    throw error;
  }
};

export const updateMedication = async (userId: string, medicationId: string, updates: Partial<Medication>) => {
  try {
    const medRef = doc(db, 'users', userId, 'medicines', medicationId);
    await updateDoc(medRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    throw error;
  }
};

export const deleteMedication = async (userId: string, medicationId: string) => {
  try {
    const medRef = doc(db, 'users', userId, 'medicines', medicationId);
    await deleteDoc(medRef);
  } catch (error) {
    console.error('Error deleting medication:', error);
    throw error;
  }
};

export const getMedications = async (userId: string): Promise<Medication[]> => {
  try {
    const medsRef = collection(db, 'users', userId, 'medicines');
    const q = query(medsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to strings if needed, or handle in UI
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Medication;
    });
  } catch (error) {
    console.error('Error getting medications:', error);
    throw error;
  }
};
