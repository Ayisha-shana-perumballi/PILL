
import React, { useState } from 'react';
import { Pill, Mail, Lock, ChevronRight, User as UserIcon, Users, UserPlus, Phone, Ruler, Scale, Calendar, Eye, EyeOff, Heart, Loader2 } from 'lucide-react';
import { User, UserRole } from '../../types';
import { signUp } from '../../services/authService';

interface SignupProps {
  onSignup: (user: User, rememberMe: boolean) => void;
  onSwitchToLogin: () => void;
  onSkip?: (role: UserRole) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin, onSkip }) => {
  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Caregiver state
  const [cgName, setCgName] = useState('');
  const [cgRelationship, setCgRelationship] = useState('Parent');
  const [cgPhone, setCgPhone] = useState('');
  const [cgEmail, setCgEmail] = useState('');
  const [patientIdToLink, setPatientIdToLink] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation for numbers
    if (role === 'patient') {
      const ageNum = parseInt(age);
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);

      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        setLoading(false);
        return setError('Invalid age (0-120)');
      }
      if (isNaN(weightNum) || weightNum < 1 || weightNum > 300) {
        setLoading(false);
        return setError('Invalid weight (1-300kg)');
      }
      if (isNaN(heightNum) || heightNum < 30 || heightNum > 250) {
        setLoading(false);
        return setError('Invalid height (30-250cm)');
      }
      
      if (!cgName || !cgPhone) {
        setLoading(false);
        return setError('Caregiver name and phone are required for patients.');
      }
    }

    if (role === 'caregiver') {
      const trimmedId = patientIdToLink.trim();
      if (!trimmedId) {
        setLoading(false);
        return setError('Please enter the Patient ID to link.');
      }
      if (!trimmedId.startsWith('PC-')) {
        setLoading(false);
        return setError('Invalid Patient ID format. Should start with PC-');
      }
    }

    if (password.length < 6) {
      setLoading(false);
      return setError('Password must be at least 6 characters.');
    }

    try {
      const user = await signUp(email, password, name, role, {
        phone: phone || '+1 (555) 000-0000',
        age: role === 'patient' ? parseInt(age) : undefined,
        weightKg: role === 'patient' ? parseFloat(weight) : undefined,
        heightCm: role === 'patient' ? parseFloat(height) : undefined,
        caregiverName: role === 'patient' ? cgName : undefined,
        caregiverRelationship: role === 'patient' ? cgRelationship : undefined,
        caregiverPhone: role === 'patient' ? cgPhone : undefined,
        caregiverEmail: role === 'patient' ? cgEmail : undefined,
        linkedPatientId: role === 'caregiver' ? patientIdToLink.trim() : undefined,
      });
      onSignup(user, rememberMe);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto px-8 pt-12 pb-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-400 mt-2">Join PillCare and start tracking today.</p>
      </header>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
        <button 
          type="button"
          onClick={() => setRole('patient')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'patient' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          <UserIcon size={18} />
          Patient
        </button>
        <button 
          type="button"
          onClick={() => setRole('caregiver')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'caregiver' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          <Users size={18} />
          Caregiver
        </button>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="signup-name">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              id="signup-name"
              type="text" 
              placeholder="Enter your name" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        
        {role === 'patient' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="signup-age">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    id="signup-age"
                    type="number" 
                    placeholder="0-120" 
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-2 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="signup-weight">Weight</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    id="signup-weight"
                    type="number" 
                    placeholder="kg" 
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-2 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="signup-height">Height</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    id="signup-height"
                    type="number" 
                    placeholder="cm" 
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-2 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Caregiver Details Section */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <div className="flex items-center gap-2 mb-3">
                 <Heart size={16} className="text-red-500" />
                 <h3 className="text-sm font-bold text-gray-900">Caregiver Details</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Caregiver Name</label>
                  <input 
                    type="text" 
                    placeholder="Who helps you with your care?" 
                    required={role === 'patient'}
                    value={cgName}
                    onChange={(e) => setCgName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Relationship</label>
                      <select 
                        value={cgRelationship}
                        onChange={(e) => setCgRelationship(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      >
                        <option>Parent</option>
                        <option>Spouse</option>
                        <option>Child</option>
                        <option>Nurse</option>
                        <option>Other</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="Required" 
                        required={role === 'patient'}
                        value={cgPhone}
                        onChange={(e) => setCgPhone(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Caregiver Email (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="Link account via email" 
                    value={cgEmail}
                    onChange={(e) => setCgEmail(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="signup-email">Account Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              id="signup-email"
              type="email" 
              placeholder="Your email address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="signup-phone">Your Phone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              id="signup-phone"
              type="tel" 
              placeholder="Your contact number" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="signup-password">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              id="signup-password"
              type={showPassword ? "text" : "password"} 
              placeholder="Create a password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {role === 'caregiver' && (
          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-bold text-blue-600 uppercase tracking-wider ml-1">Patient Connection</label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
              <input 
                type="text" 
                placeholder="Link Patient ID (e.g. PC-12345)" 
                required={role === 'caregiver'}
                value={patientIdToLink}
                onChange={(e) => setPatientIdToLink(e.target.value)}
                className="w-full bg-blue-50/50 border-dashed border-2 border-blue-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-1 mb-2">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
            />
            Remember me
          </label>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 mt-2 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Create Account
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-auto text-center pt-8 space-y-4">
        <p className="text-gray-500 text-sm">
          Already have an account? 
          <button onClick={onSwitchToLogin} className="text-blue-600 font-bold ml-1 hover:underline">Log In</button>
        </p>

        {onSkip && (
          <button 
            onClick={() => onSkip(role)}
            className="text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors uppercase tracking-widest"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default Signup;
