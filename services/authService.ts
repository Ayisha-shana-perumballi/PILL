import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { User, UserRole } from '../types';

const checkConfig = () => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set the required environment variables in .env.example');
  }
};

const generatePatientId = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `PC-${random}`;
};

export const signUp = async (email: string, password: string, name: string, role: UserRole, extraData: Partial<User> = {}): Promise<User> => {
  checkConfig();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userData: any = {
      id: firebaseUser.uid,
      name,
      email,
      role,
      phone: extraData.phone || '',
      avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
      ...extraData
    };

    if (role === 'patient') {
      userData.patientDisplayId = generatePatientId();
    }

    // Remove undefined values to avoid sending them to Firestore
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });

    // Store additional user data in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    return userData;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered.');
    }
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  checkConfig();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      throw new Error('User data not found.');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password.');
    }
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  checkConfig();
  await signOut(auth);
};

export const getCurrentUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  checkConfig();
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};

export const resetPassword = async (email: string): Promise<void> => {
  checkConfig();
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('No user found with this email address.');
    }
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userData = await getCurrentUserData(firebaseUser);
      callback(userData);
    } else {
      callback(null);
    }
  });
};
