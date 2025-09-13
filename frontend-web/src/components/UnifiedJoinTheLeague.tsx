// src/components/UnifiedJoinTheLeague.tsx - Ultimate Hybrid Registration Flow

import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Phone, MapPin, Camera, Shirt, Trophy, Star, Check, ArrowRight, ArrowLeft, Zap, Volume2, Instagram, Music, Chrome, Apple, Facebook } from "lucide-react";
import { useAuth } from '@hooks/useAuth';
import { validateForm } from '@lib/validation';

// Ultimate Hybrid Registration Flow
// Combines Locker Room animations with Player Badge design
// Theme: Digital Locker Room with Glowing Player Badge

interface Props {
  onComplete?: () => void;
  onBack?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  avatar: string;
  jerseyNumber: string;
  preferredSport: string;
  gender: string;
  skillLevel: string;
  instagram: string;
  tiktok: string;
}

const SPORTS = [
  { id: 'futsal', name: 'Futsal', icon: '⚽', gear: '👕', color: 'bg-green-500' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', gear: '👕', color: 'bg-orange-500' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', gear: '👕', color: 'bg-blue-500' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', gear: '🏸', color: 'bg-purple-500' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', gear: '🎾', color: 'bg-yellow-500' },
  { id: 'cricket', name: 'Cricket', icon: '🏏', gear: '👕', color: 'bg-red-500' }
];

const GENDERS = [
  { id: 'male', name: 'Male', icon: '👨' },
  { id: 'female', name: 'Female', icon: '👩' },
  { id: 'other', name: 'Other', icon: '⚧' },
  { id: 'prefer-not-to-say', name: 'Prefer not to say', icon: '🤐' }
];

const SKILL_LEVELS = [
  { id: 'beginner', name: 'Rookie', description: 'Just starting out', color: 'bg-gray-400' },
  { id: 'intermediate', name: 'Rising Star', description: 'Getting better', color: 'bg-blue-400' },
  { id: 'advanced', name: 'Pro', description: 'Seasoned player', color: 'bg-green-400' },
  { id: 'expert', name: 'Legend', description: 'Master of the game', color: 'bg-purple-400' }
];

export default function UnifiedJoinTheLeague({ onComplete, onBack }: Props) {
  const { register, socialLogin, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    location: 'Kathmandu, Nepal',
    avatar: '',
    jerseyNumber: '',
    preferredSport: '',
    gender: '',
    skillLevel: 'beginner',
    instagram: '',
    tiktok: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [badgeGlow, setBadgeGlow] = useState(false);
  const [gearInLocker, setGearInLocker] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Locker door opening animation based on step
  const getLockerOpenness = () => {
    switch (currentStep) {
      case 1: return '15%'; // Cracked open
      case 2: return '40%'; // Partially open
      case 3: return '70%'; // Mostly open
      case 4: return '100%'; // Fully open
      default: return '15%';
    }
  };

  // Add gear to locker as form is filled
  useEffect(() => {
    const newGear: string[] = [];
    if (formData.firstName) newGear.push('👕'); // Jersey
    if (formData.email) newGear.push('👟'); // Shoes
    if (formData.password) newGear.push('⚽'); // Ball
    if (formData.avatar) newGear.push('🏆'); // Trophy
    if (formData.preferredSport) {
      const sportData = SPORTS.find(s => s.id === formData.preferredSport);
      if (sportData) newGear.push(sportData.gear);
    }
    if (formData.instagram || formData.tiktok) newGear.push('📱'); // Phone
    setGearInLocker(newGear);
  }, [formData]);

  const steps = [
    { 
      id: 1, 
      title: 'Your Jersey Identity', 
      icon: '👕', 
      hint: 'What should we call you on the field?',
      description: 'Set up your player identity'
    },
    { 
      id: 2, 
      title: 'Pick Your Arena', 
      icon: '⚽', 
      hint: 'Choose your sport and skill level',
      description: 'Select your game and level'
    },
    { 
      id: 3, 
      title: 'Stay Connected', 
      icon: '📱', 
      hint: 'How can we reach you?',
      description: 'Set up your contact info'
    },
    { 
      id: 4, 
      title: 'Your Player Badge', 
      icon: '🏆', 
      hint: 'Ready to join the league?',
      description: 'Review and complete your badge'
    }
  ];

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
        username: formData.username || formData.email,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        preferredSport: formData.preferredSport || 'Futsal',
        location: formData.location
      });
      
      setBadgeGlow(true);
      setShowSuccess(true);
      
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await socialLogin(provider);
      if (onComplete) onComplete();
    } catch (error) {
      console.error(`${provider} login failed:`, error);
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

      {/* Main Registration Card - Player Badge Style */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Glowing Player Badge Card */}
          <div className={`relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 transition-all duration-1000 ${
            badgeGlow ? 'animate-badge-glow shadow-2xl shadow-nepal-crimson/50' : ''
          }`}>
            {/* Badge Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-nepal-crimson to-nepal-blue rounded-full mb-4 shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Join the League</h1>
              <p className="text-gray-600">Create your player badge and step onto the field</p>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step.id <= currentStep ? 'bg-nepal-crimson' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-8">
              {/* Step Header */}
              <div className="text-center">
                <div className="text-4xl mb-2">{steps[currentStep - 1].icon}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-600">{steps[currentStep - 1].hint}</p>
              </div>

              {/* Form Steps */}
              {currentStep === 1 && <Step1Identity formData={formData} setFormData={setFormData} errors={errors} />}
              {currentStep === 2 && <Step2Sport formData={formData} setFormData={setFormData} />}
              {currentStep === 3 && <Step3Contact formData={formData} setFormData={setFormData} passwordStrength={passwordStrength} />}
              {currentStep === 4 && <Step4Badge formData={formData} fileInputRef={fileInputRef} handleAvatarUpload={handleAvatarUpload} />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-nepal-crimson text-white rounded-xl hover:bg-nepal-crimson/90 transition-colors font-semibold shadow-lg"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-nepal-crimson to-nepal-blue text-white rounded-xl hover:from-nepal-crimson/90 hover:to-nepal-blue/90 transition-all font-bold shadow-lg disabled:opacity-50"
                >
                  <Trophy className="h-5 w-5" />
                  {isLoading ? 'Creating Badge...' : 'Join the League'}
                </button>
              )}
            </div>

            {/* Social Login */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500 mb-4">Or join with</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { provider: 'google', icon: Chrome, color: 'bg-red-500', text: 'Google' },
                  { provider: 'apple', icon: Apple, color: 'bg-gray-800', text: 'Apple' },
                  { provider: 'facebook', icon: Facebook, color: 'bg-blue-600', text: 'Facebook' },
                  { provider: 'instagram', icon: Instagram, color: 'bg-pink-500', text: 'Instagram' },
                  { provider: 'tiktok', icon: Music, color: 'bg-black', text: 'TikTok' }
                ].map(({ provider, icon: Icon, color, text }) => (
                  <button
                    key={provider}
                    onClick={() => handleSocialLogin(provider)}
                    className={`flex items-center gap-2 px-4 py-2 ${color} text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium`}
                  >
                    <Icon className="h-4 w-4" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce max-w-md mx-4 shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-nepal-crimson mb-2">Welcome to the League!</h3>
            <p className="text-gray-600 mb-4">Your player badge is ready and the locker is open!</p>
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
        {['⚽', '🏀', '🏐', '🎾', '🏸', '🏏'].map((icon, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10 animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 12}%`,
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

function Step1Identity({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Your first name"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Your last name"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pick your jersey number
        </label>
        <div className="relative">
          <Shirt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="e.g., player23, striker99"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">This will be your unique player ID</p>
      </div>
    </div>
  );
}

function Step2Sport({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      {/* Preferred Sport */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose your arena
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setFormData(prev => ({ ...prev, preferredSport: sport.id }))}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                formData.preferredSport === sport.id
                  ? 'border-nepal-crimson bg-nepal-crimson/10 text-nepal-crimson'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-3xl mb-2">{sport.icon}</div>
              <div className="text-sm font-medium">{sport.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Gender (optional)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {GENDERS.map((gender) => (
            <button
              key={gender.id}
              onClick={() => setFormData(prev => ({ ...prev, gender: gender.id }))}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.gender === gender.id
                  ? 'border-nepal-crimson bg-nepal-crimson/10 text-nepal-crimson'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{gender.icon}</div>
              <div className="text-xs font-medium">{gender.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your skill level?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${level.color}`}></div>
              <div className="text-sm font-medium">{level.name}</div>
              <div className="text-xs text-gray-500">{level.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Contact({ formData, setFormData, passwordStrength }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              placeholder="+977 98XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Set your defense password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="password"
            placeholder="Strong password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Kathmandu, Nepal"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );
}

function Step4Badge({ formData, fileInputRef, handleAvatarUpload }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-6">Complete your player badge and join the league</p>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4">
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
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jersey Number (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., 23"
            value={formData.jerseyNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, jerseyNumber: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram Handle (optional)
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-500" />
            <input
              type="text"
              placeholder="@yourusername"
              value={formData.instagram}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TikTok Handle (optional)
          </label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
            <input
              type="text"
              placeholder="@yourusername"
              value={formData.tiktok}
              onChange={(e) => setFormData(prev => ({ ...prev, tiktok: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Preview Badge */}
      <div className="bg-gradient-to-br from-nepal-blue to-nepal-crimson rounded-2xl p-6 text-white text-center shadow-2xl">
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
          {formData.preferredSport && (
            <span className="text-2xl">
              {SPORTS.find(s => s.id === formData.preferredSport)?.icon}
            </span>
          )}
        </div>
        
        <div className="text-sm opacity-90">
          Ready to join the league!
        </div>
      </div>
    </div>
  );
}

// Ultimate Hybrid Registration Flow
// Combines Locker Room animations with Player Badge design
// Theme: Digital Locker Room with Glowing Player Badge

interface Props {
  onComplete?: () => void;
  onBack?: () => void;
}
