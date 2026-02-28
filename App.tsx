
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { TabType, Medication, MedicationStatus, User, UserRole, PatientProfile, PatientNote, AIChangeRequest, ApprovalStatus, RefillRequest, MedicationLog } from './types';
import Navigation from './components/Navigation';
import Home from './components/Home';
import History from './components/History';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import CalendarView from './components/CalendarView';
import AIChat from './components/AIChat';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import CaregiverDashboard from './components/Caregiver/CaregiverDashboard';
import PatientDetail from './components/Caregiver/PatientDetail';

import { signUp, login as loginService, logout as logoutService, subscribeToAuthChanges } from './services/authService';
import { addMedication, updateMedication, deleteMedication, getMedications } from './services/medicationService';
import { auth, isFirebaseConfigured } from './firebase';

const SESSION_KEY = 'pillcare_session';
const MEDS_KEY = 'pillcare_meds';
const PATIENTS_KEY = 'pillcare_patients';
const AI_REQUESTS_KEY = 'pillcare_ai_requests';
const REFILL_REQUESTS_KEY = 'pillcare_refill_requests';
const MED_LOGS_KEY = 'pillcare_med_logs';

const INITIAL_MOCK_PATIENTS: PatientProfile[] = [
  {
    id: 'p1',
    name: 'Robert Anderson',
    patientDisplayId: 'PC-88231',
    age: 68,
    gender: 'Male',
    condition: 'Type 2 Diabetes',
    adherence: 88,
    avatar: 'https://i.pravatar.cc/150?u=robert',
    meds: [
      { id: '1', name: 'Metformin', dosage: '500mg', time: '8:00 AM', status: MedicationStatus.UPCOMING, category: 'Diabetes', pillsRemaining: 12, totalPills: 30, dailyDosageCount: 1 },
      { id: '3', name: 'Atorvastatin', dosage: '20mg', time: '2:00 PM', status: MedicationStatus.UPCOMING, category: 'Cholesterol', pillsRemaining: 24, totalPills: 30, dailyDosageCount: 1 },
    ],
    notes: [
      { id: 'n1', text: 'Robert mentioned feeling slight dizziness after the morning dose. Monitoring closely.', timestamp: 'OCT 22, 09:15 AM' }
    ]
  }
];

const DEFAULT_MEDS: Medication[] = [
  { id: '1', name: 'Metformin', dosage: '500mg', time: '8:00 AM', status: MedicationStatus.UPCOMING, category: 'Diabetes', pillsRemaining: 12, totalPills: 30, dailyDosageCount: 2, refillThreshold: 5 },
  { id: '2', name: 'Lisinopril', dosage: '10mg', time: '8:00 AM', status: MedicationStatus.UPCOMING, category: 'Blood Pressure', pillsRemaining: 8, totalPills: 30, dailyDosageCount: 1, refillThreshold: 5 },
  { id: '3', name: 'Atorvastatin', dosage: '20mg', time: '2:00 PM', status: MedicationStatus.UPCOMING, category: 'Cholesterol', pillsRemaining: 25, totalPills: 30, dailyDosageCount: 1, refillThreshold: 5 },
  { id: '4', name: 'Aspirin', dosage: '81mg', time: '8:00 PM', status: MedicationStatus.UPCOMING, category: 'Heart', pillsRemaining: 2, totalPills: 30, dailyDosageCount: 1, refillThreshold: 5 },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  const [meds, setMeds] = useState<Medication[]>(() => {
    const saved = localStorage.getItem(MEDS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_MEDS;
  });
  
  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    const saved = localStorage.getItem(PATIENTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MOCK_PATIENTS;
  });

  const [aiRequests, setAIRequests] = useState<AIChangeRequest[]>(() => {
    const saved = localStorage.getItem(AI_REQUESTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [refillRequests, setRefillRequests] = useState<RefillRequest[]>(() => {
    const saved = localStorage.getItem(REFILL_REQUESTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>(() => {
    const saved = localStorage.getItem(MED_LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === 'patient') {
      const fetchMeds = async () => {
        try {
          const firestoreMeds = await getMedications(currentUser.id);
          if (firestoreMeds.length > 0) {
            setMeds(firestoreMeds);
          }
        } catch (error) {
          console.error('Failed to fetch medications:', error);
        }
      };
      fetchMeds();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(MEDS_KEY, JSON.stringify(meds));
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
    localStorage.setItem(AI_REQUESTS_KEY, JSON.stringify(aiRequests));
    localStorage.setItem(REFILL_REQUESTS_KEY, JSON.stringify(refillRequests));
    localStorage.setItem(MED_LOGS_KEY, JSON.stringify(medicationLogs));
  }, [meds, patients, aiRequests, refillRequests, medicationLogs]);

  const getMedsForDate = (date: Date, baseMeds: Medication[]) => {
    const dateStr = date.toISOString().split('T')[0];
    const isFuture = new Date(dateStr) > new Date(new Date().toISOString().split('T')[0]);

    return baseMeds.map(m => {
      const log = medicationLogs.find(l => l.medicationId === m.id && l.date === dateStr && l.time === m.time);
      if (log) {
        return { ...m, status: log.status };
      }
      // If no log exists, it's Upcoming (unless it's past, but user said default Upcoming)
      // Actually user said: "If selected date is in the future: All medicines should show Upcoming by default."
      // "If no record exists for that date: Default status = Upcoming"
      return { ...m, status: MedicationStatus.UPCOMING };
    });
  };

  const currentMeds = getMedsForDate(selectedDate, meds);

  const adherence = currentMeds.length > 0 
    ? Math.round((currentMeds.filter(m => m.status === MedicationStatus.TAKEN).length / currentMeds.length) * 100)
    : 0;

  const handleApplyAIChange = (request: Omit<AIChangeRequest, 'id' | 'status' | 'timestamp'>) => {
    const newRequest: AIChangeRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: ApprovalStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    setAIRequests(prev => [newRequest, ...prev]);
  };

  const handleApproveRequest = (requestId: string) => {
    const request = aiRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update Request Status
    setAIRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: ApprovalStatus.APPROVED } : r
    ));

    // Update Actual Patient Medication
    setPatients(prev => prev.map(p => {
      if (p.id === request.patientId) {
        return {
          ...p,
          meds: p.meds.map(m => m.id === request.medicationId ? { ...m, time: request.newTime } : m)
        };
      }
      return p;
    }));

    // If it's for the current patient user, update their local list too
    if (currentUser?.id === request.patientId || currentUser?.role === 'patient') {
       setMeds(prev => prev.map(m => m.id === request.medicationId ? { ...m, time: request.newTime } : m));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setAIRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: ApprovalStatus.REJECTED } : r
    ));
  };

  const handleRequestRefill = (medicationId: string) => {
    const med = meds.find(m => m.id === medicationId);
    if (!med || !currentUser) return;

    const newRequest: RefillRequest = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: currentUser.id,
      patientName: currentUser.name,
      medicationId: med.id,
      medicationName: med.name,
      pillsRemaining: med.pillsRemaining || 0,
      status: ApprovalStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    setRefillRequests(prev => [newRequest, ...prev]);
  };

  const handleApproveRefill = (requestId: string) => {
    const request = refillRequests.find(r => r.id === requestId);
    if (!request) return;

    setRefillRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: ApprovalStatus.APPROVED } : r
    ));

    // Update patient stock
    setPatients(prev => prev.map(p => {
      if (p.id === request.patientId) {
        return {
          ...p,
          meds: p.meds.map(m => m.id === request.medicationId ? { ...m, pillsRemaining: (m.totalPills || 30), lastRefillDate: new Date().toISOString() } : m)
        };
      }
      return p;
    }));

    // Update local meds if it's the current user
    if (currentUser?.id === request.patientId) {
      setMeds(prev => prev.map(m => m.id === request.medicationId ? { ...m, pillsRemaining: (m.totalPills || 30), lastRefillDate: new Date().toISOString() } : m));
    }
  };

  const handleRejectRefill = (requestId: string) => {
    setRefillRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: ApprovalStatus.REJECTED } : r
    ));
  };

  const handleLogin = async (user: User, rememberMe: boolean) => {
    setCurrentUser(user);
    setActiveTab('home');
  };

  const handleSignup = async (user: User, rememberMe: boolean = true) => {
    setCurrentUser(user);
    setActiveTab('home');
  };

  const handleLogout = async () => {
    await logoutService();
    setCurrentUser(null);
    setAuthView('login');
    setSelectedPatientId(null);
    setMeds(DEFAULT_MEDS); // Reset to default on logout
  };

  const handleAddMedication = async (medData: Omit<Medication, 'id'>) => {
    if (!currentUser) return;
    try {
      const id = await addMedication(currentUser.id, medData);
      const newMed = { ...medData, id };
      setMeds(prev => [newMed, ...prev]);
      alert('Medicine added successfully!');
    } catch (error) {
      alert('Failed to add medicine.');
    }
  };

  const handleUpdateMedication = async (id: string, updates: Partial<Medication>) => {
    if (!currentUser) return;
    try {
      await updateMedication(currentUser.id, id, updates);
      setMeds(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      alert('Medicine updated successfully!');
    } catch (error) {
      alert('Failed to update medicine.');
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await deleteMedication(currentUser.id, id);
      setMeds(prev => prev.filter(m => m.id !== id));
      alert('Medicine deleted successfully!');
    } catch (error) {
      alert('Failed to delete medicine.');
    }
  };

  const handleMarkAsTaken = (id: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const med = meds.find(m => m.id === id);
    if (!med) return;

    const newLog: MedicationLog = {
      medicationId: id,
      date: dateStr,
      time: med.time,
      status: MedicationStatus.TAKEN,
      timestamp: new Date().toISOString()
    };

    setMedicationLogs(prev => {
      // Remove existing log for same med/date/time if any
      const filtered = prev.filter(l => !(l.medicationId === id && l.date === dateStr && l.time === med.time));
      return [newLog, ...filtered];
    });

    // Still update pill count on the base med
    setMeds(prev => prev.map(m => {
      if (m.id === id) {
        const pillsRemaining = (m.pillsRemaining ?? 0) > 0 ? (m.pillsRemaining! - 1) : 0;
        return { ...m, pillsRemaining, lastTakenTime: new Date().toISOString() };
      }
      return m;
    }));
  };

  const handleUndoStatus = (id: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const med = meds.find(m => m.id === id);
    if (!med) return;

    const existingLog = medicationLogs.find(l => l.medicationId === id && l.date === dateStr && l.time === med.time);
    
    setMedicationLogs(prev => prev.filter(l => !(l.medicationId === id && l.date === dateStr && l.time === med.time)));

    // If we were at "Taken" and moving away, restore the pill count
    if (existingLog && existingLog.status === MedicationStatus.TAKEN) {
      setMeds(prev => prev.map(m => {
        if (m.id === id) {
          const pillsRemaining = (m.pillsRemaining ?? 0) + 1;
          return { ...m, pillsRemaining };
        }
        return m;
      }));
    }
  };

  const handleRedoStatus = (id: string) => {
    // Redo is basically marking as taken again for the current selected date
    handleMarkAsTaken(id);
  };

  const handleUpdateStock = (id: string, count: number) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, pillsRemaining: count, totalPills: Math.max(m.totalPills || 0, count) } : m));
  };

  const handleAddNote = (patientId: string, text: string) => {
    const note: PatientNote = { id: Math.random().toString(36).substr(2, 9), text, timestamp: new Date().toLocaleString().toUpperCase() };
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, notes: [note, ...(p.notes || [])] } : p));
  };

  const handleSetReminder = (pId: string, mId: string, t: string | undefined) => {
    setPatients(prev => prev.map(p => p.id === pId ? { ...p, meds: p.meds.map(m => m.id === mId ? { ...m, reminderTime: t } : m) } : p));
  };

  const handleSkip = (role: UserRole = 'patient') => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@pillcare.com',
      role: role,
      phone: '+1 (555) 000-0000',
      avatar: 'https://i.pravatar.cc/150?u=guest',
      patientDisplayId: role === 'patient' ? 'PC-GUEST' : undefined,
      linkedPatientId: role === 'caregiver' ? 'PC-GUEST' : undefined
    };
    setCurrentUser(guestUser);
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
        <div className="bg-white p-8 rounded-[40px] shadow-xl max-w-sm">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 mx-auto">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Firebase API keys are missing. Please set the required environment variables in your project settings to enable authentication.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Required Variables:</p>
            <ul className="text-[10px] font-bold text-gray-600 space-y-1">
              <li>• VITE_FIREBASE_API_KEY</li>
              <li>• VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>• VITE_FIREBASE_PROJECT_ID</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) return authView === 'login' 
    ? <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} onSkip={handleSkip} /> 
    : <Signup onSignup={handleSignup} onSwitchToLogin={() => setAuthView('login')} onSkip={handleSkip} />;

  const renderScreen = () => {
    if (currentUser.role === 'caregiver') {
      if (selectedPatientId) {
        const patient = patients.find(p => p.id === selectedPatientId)!;
        return <PatientDetail 
          patient={patient} 
          onBack={() => setSelectedPatientId(null)} 
          onUndoStatus={handleUndoStatus}
          onMarkAsTaken={handleMarkAsTaken}
          onAddNote={(text) => handleAddNote(patient.id, text)}
          onSetReminder={(medId, time) => handleSetReminder(patient.id, medId, time)}
          refillRequests={refillRequests.filter(r => r.patientId === patient.id)}
          onApproveRefill={handleApproveRefill}
          onRejectRefill={handleRejectRefill}
        />;
      }
      switch (activeTab) {
        case 'home': return <CaregiverDashboard 
          patients={patients} 
          onSelectPatient={(p) => setSelectedPatientId(p.id)} 
          aiRequests={aiRequests} 
          onApproveRequest={handleApproveRequest} 
          onRejectRequest={handleRejectRequest}
          refillRequests={refillRequests}
          onApproveRefill={handleApproveRefill}
          onRejectRefill={handleRejectRefill}
        />;
        case 'alerts': return <Alerts meds={meds} />;
        case 'settings': return <Settings user={currentUser} onLogout={handleLogout} />;
        default: return <CaregiverDashboard 
          patients={patients} 
          onSelectPatient={(p) => setSelectedPatientId(p.id)} 
          aiRequests={aiRequests} 
          onApproveRequest={handleApproveRequest} 
          onRejectRequest={handleRejectRequest}
          refillRequests={refillRequests}
          onApproveRefill={handleApproveRefill}
          onRejectRefill={handleRejectRefill}
        />;
      }
    }

    switch (activeTab) {
      case 'home': return <Home 
        user={currentUser} 
        meds={currentMeds} 
        adherence={adherence} 
        onMarkAsTaken={handleMarkAsTaken} 
        onUndoStatus={handleUndoStatus} 
        onRedoStatus={handleRedoStatus} 
        onApplyAIChange={handleApplyAIChange} 
        aiRequests={aiRequests}
        onRefillRequest={handleRequestRefill}
        refillRequests={refillRequests}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onAddMedication={handleAddMedication}
        onUpdateMedication={handleUpdateMedication}
        onDeleteMedication={handleDeleteMedication}
      />;
      case 'calendar': return <CalendarView 
        meds={meds} 
        onUpdateStock={handleUpdateStock} 
        onUndoStatus={handleUndoStatus}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        medicationLogs={medicationLogs}
      />;
      case 'history': return <History meds={meds} />;
      case 'alerts': return <Alerts meds={meds} />;
      case 'settings': return <Settings user={currentUser} onLogout={handleLogout} />;
      default: return <Home 
        user={currentUser} 
        meds={currentMeds} 
        adherence={adherence} 
        onMarkAsTaken={handleMarkAsTaken} 
        onUndoStatus={handleUndoStatus} 
        onRedoStatus={handleRedoStatus} 
        onApplyAIChange={handleApplyAIChange} 
        aiRequests={aiRequests} 
        onRefillRequest={handleRequestRefill}
        refillRequests={refillRequests}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onAddMedication={handleAddMedication}
        onUpdateMedication={handleUpdateMedication}
        onDeleteMedication={handleDeleteMedication}
      />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-200">
      <main className="flex-1 pb-24 overflow-y-auto hide-scrollbar">{renderScreen()}</main>
      <AIChat />
      {!selectedPatientId && <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isCaregiver={currentUser.role === 'caregiver'} />}
    </div>
  );
};

export default App;
