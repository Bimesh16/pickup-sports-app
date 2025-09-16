// src/components/LockerRoomRegistration.tsx - Ultimate Locker Room Registration Flow

import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Camera, Shirt, Trophy, Star, Check, ArrowRight, ArrowLeft, Zap, Volume2 } from "lucide-react";
import { useAuth } from '@hooks/useAuth';

// 4-Step Locker Room Registration Flow
// Theme: Digital Locker Room with gear animations and micro-interactions

interface Props {
  onComplete?: () => void;
  onBack?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  jerseyNumber: string;
  sports: string[];
  skillLevel: string;
}

const SPORTS = [
  { id: 'soccer', name: 'Soccer', icon: '⚽', gear: '👕' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', gear: '👕' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', gear: '👕' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', gear: '🏸' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', gear: '🎾' },
  { id: 'cricket', name: 'Cricket', icon: '🏏', gear: '👕' },
  { id: 'futsal', name: 'Futsal', icon: '⚽', gear: '👕' },
  { id: 'football', name: 'Football', icon: '🏈', gear: '👕' }
];

const SKILL_LEVELS = [
  { id: 'beginner', name: 'Rookie', description: 'Just starting out' },
  { id: 'intermediate', name: 'Rising Star', description: 'Getting better' },
  { id: 'advanced', name: 'Pro', description: 'Seasoned player' },
  { id: 'expert', name: 'Legend', description: 'Master of the game' }
];

export default function LockerRoomRegistration({ onComplete, onBack }: Props) {
  const { register, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    avatar: '',
    jerseyNumber: '',
    sports: [],
    skillLevel: 'beginner'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [gearInLocker, setGearInLocker] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Locker door opening animation based on step
  const getLockerOpenness = () => {
    switch (currentStep) {
      case 1: return '10%'; // Cracked open
      case 2: return '30%'; // Partially open
      case 3: return '60%'; // Mostly open
      case 4: return '100%'; // Fully open
      default: return '10%';
    }
  };

  // Add gear to locker as form is filled
  useEffect(() => {
    const newGear: string[] = [];
    if (formData.firstName) newGear.push('👕'); // Jersey
    if (formData.email) newGear.push('👟'); // Shoes
    if (formData.password) newGear.push('⚽'); // Ball
    if (formData.avatar) newGear.push('🏆'); // Trophy
    if (formData.sports.length > 0) {
      formData.sports.forEach(sport => {
        const sportData = SPORTS.find(s => s.id === sport);
        if (sportData) newGear.push(sportData.gear);
      });
    }
    setGearInLocker(newGear);
  }, [formData]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    try {
      await register({
        username: formData.email,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        preferredSport: formData.sports[0] || 'Futsal',
        location: 'Kathmandu, Nepal'
      });
      
      setShowSuccess(true);
      // Play success sound and confetti
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSport = (sportId: string) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(id => id !== sportId)
        : [...prev.sports, sportId]
    }));
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
      {/* Locker Room Background */}
      <LockerRoomBackground />
      
      {/* Locker Door with Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-96 h-96 bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg shadow-2xl border-4 border-amber-700"
          style={{
            clipPath: `polygon(0 0, ${getLockerOpenness()} 0, ${getLockerOpenness()} 100%, 0 100%)`,
            transition: 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Locker Interior */}
          <div className="absolute inset-4 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg p-6">
            {/* Locker Shelves */}
            <div className="grid grid-cols-3 gap-2 h-full">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="bg-amber-300 rounded border-2 border-amber-400 flex items-center justify-center">
                  {gearInLocker[i] && (
                    <span className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                      {gearInLocker[i]}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Locker Number */}
            <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">
              #{Math.floor(Math.random() * 99) + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Panel */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step <= currentStep ? 'bg-nepal-crimson' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && <Step1PlayerDetails formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} passwordStrength={passwordStrength} />}
            {currentStep === 2 && <Step2AvatarSetup formData={formData} setFormData={setFormData} fileInputRef={fileInputRef} handleAvatarUpload={handleAvatarUpload} />}
            {currentStep === 3 && <Step3SportPreferences formData={formData} toggleSport={toggleSport} />}
            {currentStep === 4 && <Step4Confirmation formData={formData} />}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-nepal-crimson text-white rounded-lg hover:bg-nepal-crimson/90 transition-colors font-semibold"
                >
                  {currentStep === 1 ? 'Open the locker' : currentStep === 2 ? 'Save my badge' : 'I\'m ready to play'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-nepal-crimson text-white rounded-lg hover:bg-nepal-crimson/90 transition-colors font-semibold disabled:opacity-50"
                >
                  <Trophy className="h-4 w-4" />
                  {isLoading ? 'Joining the League...' : 'Step onto the field'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce max-w-md mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-nepal-crimson mb-2">Welcome to the League!</h3>
            <p className="text-gray-600 mb-4">Your locker is ready and the team is waiting!</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Volume2 className="h-4 w-4" />
              <span>Play fair. Have fun. ⚡</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LockerRoomBackground() {
  return (
    <div className="absolute inset-0">
      {/* Locker Room Lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/50 via-orange-800/30 to-red-900/50" />
      
      {/* Locker Room Grid Pattern */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_98px,rgba(255,255,255,0.03)_100px)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_98px,rgba(255,255,255,0.03)_100px)]" />
      
      {/* Floating Sports Equipment */}
      <div className="absolute inset-0 overflow-hidden">
        {['⚽', '🏀', '🏐', '🎾', '🏸'].map((icon, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10 animate-float"
            style={{
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: '8s'
            }}
          >
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step1PlayerDetails({ formData, setFormData, errors, setErrors, passwordStrength }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your locker is waiting</h2>
        <p className="text-gray-600">Let's get you set up with the basics</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What should we call you on the field?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last name
            </label>
            <input
              type="text"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your team contact
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Set your defense
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              placeholder="Strong password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
            />
          </div>
          
          {/* Password Strength Meter */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength 
                        ? passwordStrength < 3 
                          ? 'bg-red-500' 
                          : passwordStrength < 4 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Coach tip: use a strong password—it's your defense
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step2AvatarSetup({ formData, setFormData, fileInputRef, handleAvatarUpload }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Add your jersey (avatar)</h2>
        <p className="text-gray-600">Upload a photo for your player badge</p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-nepal-blue to-nepal-crimson rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar preview"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Camera className="h-12 w-12 text-white" />
            )}
          </div>
          {formData.avatar && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Camera className="h-4 w-4" />
          {formData.avatar ? 'Change Photo' : 'Upload Photo'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />

        {/* Jersey Number */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pick your jersey number (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., 23"
            value={formData.jerseyNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, jerseyNumber: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

function Step3SportPreferences({ formData, toggleSport }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">What's in your locker?</h2>
        <p className="text-gray-600">Choose your favorite sports</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            onClick={() => toggleSport(sport.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              formData.sports.includes(sport.id)
                ? 'border-nepal-crimson bg-nepal-crimson/10 text-nepal-crimson'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-3xl mb-2">{sport.icon}</div>
            <div className="text-sm font-medium">{sport.name}</div>
          </button>
        ))}
      </div>

      {/* Skill Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your skill level?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setFormData(prev => ({ ...prev, skillLevel: level.id }))}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.skillLevel === level.id
                  ? 'border-nepal-crimson bg-nepal-crimson/10 text-nepal-crimson'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{level.name}</div>
              <div className="text-xs text-gray-500">{level.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4Confirmation({ formData }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the League!</h2>
        <p className="text-gray-600">Your player badge is ready</p>
      </div>

      {/* Player Badge */}
      <div className="bg-gradient-to-br from-nepal-blue to-nepal-crimson rounded-2xl p-6 text-white text-center shadow-2xl animate-pulse">
        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt="Player avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-nepal-crimson" />
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-1">
          {formData.firstName} {formData.lastName}
        </h3>
        
        {formData.jerseyNumber && (
          <div className="text-lg font-semibold mb-2">#{formData.jerseyNumber}</div>
        )}
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {formData.sports.map((sportId: string) => {
            const sport = SPORTS.find(s => s.id === sportId);
            return sport ? (
              <span key={sportId} className="text-2xl">{sport.icon}</span>
            ) : null;
          })}
        </div>
        
        <div className="text-sm opacity-90">
          Ready to play!
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          <span>Play fair. Have fun. ⚡</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Camera, Shirt, Trophy, Star, Check, ArrowRight, ArrowLeft, Zap, Volume2 } from "lucide-react";
import { useAuth } from '@hooks/useAuth';

// 4-Step Locker Room Registration Flow
// Theme: Digital Locker Room with gear animations and micro-interactions

interface Props {
  onComplete?: () => void;
  onBack?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  jerseyNumber: string;
  sports: string[];
  skillLevel: string;
}

const SPORTS = [
  { id: 'soccer', name: 'Soccer', icon: '⚽', gear: '👕' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', gear: '👕' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', gear: '👕' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', gear: '🏸' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', gear: '🎾' },
  { id: 'cricket', name: 'Cricket', icon: '🏏', gear: '👕' },
  { id: 'futsal', name: 'Futsal', icon: '⚽', gear: '👕' },
  { id: 'football', name: 'Football', icon: '🏈', gear: '👕' }
];

const SKILL_LEVELS = [
  { id: 'beginner', name: 'Rookie', description: 'Just starting out' },
  { id: 'intermediate', name: 'Rising Star', description: 'Getting better' },
  { id: 'advanced', name: 'Pro', description: 'Seasoned player' },
  { id: 'expert', name: 'Legend', description: 'Master of the game' }
];

export default function LockerRoomRegistration({ onComplete, onBack }: Props) {
  const { register, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    avatar: '',
    jerseyNumber: '',
    sports: [],
    skillLevel: 'beginner'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [gearInLocker, setGearInLocker] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Locker door opening animation based on step
  const getLockerOpenness = () => {
    switch (currentStep) {
      case 1: return '10%'; // Cracked open
      case 2: return '30%'; // Partially open
      case 3: return '60%'; // Mostly open
      case 4: return '100%'; // Fully open
      default: return '10%';
    }
  };

  // Add gear to locker as form is filled
  useEffect(() => {
    const newGear: string[] = [];
    if (formData.firstName) newGear.push('👕'); // Jersey
    if (formData.email) newGear.push('👟'); // Shoes
    if (formData.password) newGear.push('⚽'); // Ball
    if (formData.avatar) newGear.push('🏆'); // Trophy
    if (formData.sports.length > 0) {
      formData.sports.forEach(sport => {
        const sportData = SPORTS.find(s => s.id === sport);
        if (sportData) newGear.push(sportData.gear);
      });
    }
    setGearInLocker(newGear);
  }, [formData]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    try {
      await register({
        username: formData.email,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        preferredSport: formData.sports[0] || 'Futsal',
        location: 'Kathmandu, Nepal'
      });
      
      setShowSuccess(true);
      // Play success sound and confetti
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSport = (sportId: string) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(id => id !== sportId)
        : [...prev.sports, sportId]
    }));
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
      {/* Locker Room Background */}
      <LockerRoomBackground />
      
      {/* Locker Door with Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-96 h-96 bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg shadow-2xl border-4 border-amber-700"
          style={{
            clipPath: `polygon(0 0, ${getLockerOpenness()} 0, ${getLockerOpenness()} 100%, 0 100%)`,
            transition: 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Locker Interior */}
          <div className="absolute inset-4 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg p-6">
            {/* Locker Shelves */}
            <div className="grid grid-cols-3 gap-2 h-full">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="bg-amber-300 rounded border-2 border-amber-400 flex items-center justify-center">
                  {gearInLocker[i] && (
                    <span className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                      {gearInLocker[i]}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Locker Number */}
            <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">
              #{Math.floor(Math.random() * 99) + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Panel */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step <= currentStep ? 'bg-nepal-crimson' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && <Step1PlayerDetails formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} passwordStrength={passwordStrength} />}
            {currentStep === 2 && <Step2AvatarSetup formData={formData} setFormData={setFormData} fileInputRef={fileInputRef} handleAvatarUpload={handleAvatarUpload} />}
            {currentStep === 3 && <Step3SportPreferences formData={formData} toggleSport={toggleSport} />}
            {currentStep === 4 && <Step4Confirmation formData={formData} />}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-nepal-crimson text-white rounded-lg hover:bg-nepal-crimson/90 transition-colors font-semibold"
                >
                  {currentStep === 1 ? 'Open the locker' : currentStep === 2 ? 'Save my badge' : 'I\'m ready to play'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-nepal-crimson text-white rounded-lg hover:bg-nepal-crimson/90 transition-colors font-semibold disabled:opacity-50"
                >
                  <Trophy className="h-4 w-4" />
                  {isLoading ? 'Joining the League...' : 'Step onto the field'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce max-w-md mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-nepal-crimson mb-2">Welcome to the League!</h3>
            <p className="text-gray-600 mb-4">Your locker is ready and the team is waiting!</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Volume2 className="h-4 w-4" />
              <span>Play fair. Have fun. ⚡</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LockerRoomBackground() {
  return (
    <div className="absolute inset-0">
      {/* Locker Room Lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/50 via-orange-800/30 to-red-900/50" />
      
      {/* Locker Room Grid Pattern */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_98px,rgba(255,255,255,0.03)_100px)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_98px,rgba(255,255,255,0.03)_100px)]" />
      
      {/* Floating Sports Equipment */}
      <div className="absolute inset-0 overflow-hidden">
        {['⚽', '🏀', '🏐', '🎾', '🏸'].map((icon, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10 animate-float"
            style={{
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: '8s'
            }}
          >
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step1PlayerDetails({ formData, setFormData, errors, setErrors, passwordStrength }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your locker is waiting</h2>
        <p className="text-gray-600">Let's get you set up with the basics</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What should we call you on the field?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last name
            </label>
            <input
              type="text"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your team contact
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Set your defense
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              placeholder="Strong password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
            />
          </div>
          
          {/* Password Strength Meter */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength 
                        ? passwordStrength < 3 
                          ? 'bg-red-500' 
                          : passwordStrength < 4 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Coach tip: use a strong password—it's your defense
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step2AvatarSetup({ formData, setFormData, fileInputRef, handleAvatarUpload }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Add your jersey (avatar)</h2>
        <p className="text-gray-600">Upload a photo for your player badge</p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-nepal-blue to-nepal-crimson rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar preview"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Camera className="h-12 w-12 text-white" />
            )}
          </div>
          {formData.avatar && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Camera className="h-4 w-4" />
          {formData.avatar ? 'Change Photo' : 'Upload Photo'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />

        {/* Jersey Number */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pick your jersey number (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., 23"
            value={formData.jerseyNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, jerseyNumber: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

function Step3SportPreferences({ formData, toggleSport }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">What's in your locker?</h2>
        <p className="text-gray-600">Choose your favorite sports</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            onClick={() => toggleSport(sport.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              formData.sports.includes(sport.id)
                ? 'border-nepal-crimson bg-nepal-crimson/10 text-nepal-crimson'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-3xl mb-2">{sport.icon}</div>
            <div className="text-sm font-medium">{sport.name}</div>
          </button>
        ))}
      </div>

      {/* Skill Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your skill level?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setFormData(prev => ({ ...prev, skillLevel: level.id }))}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.skillLevel === level.id
                  ? 'border-nepal-crimson bg-nepal-crimson/10 text-nepal-crimson'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{level.name}</div>
              <div className="text-xs text-gray-500">{level.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4Confirmation({ formData }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the League!</h2>
        <p className="text-gray-600">Your player badge is ready</p>
      </div>

      {/* Player Badge */}
      <div className="bg-gradient-to-br from-nepal-blue to-nepal-crimson rounded-2xl p-6 text-white text-center shadow-2xl animate-pulse">
        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt="Player avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-nepal-crimson" />
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-1">
          {formData.firstName} {formData.lastName}
        </h3>
        
        {formData.jerseyNumber && (
          <div className="text-lg font-semibold mb-2">#{formData.jerseyNumber}</div>
        )}
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {formData.sports.map((sportId: string) => {
            const sport = SPORTS.find(s => s.id === sportId);
            return sport ? (
              <span key={sportId} className="text-2xl">{sport.icon}</span>
            ) : null;
          })}
        </div>
        
        <div className="text-sm opacity-90">
          Ready to play!
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          <span>Play fair. Have fun. ⚡</span>
        </div>
      </div>
    </div>
  );
}
