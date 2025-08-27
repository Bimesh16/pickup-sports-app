import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../lib/auth';
import { userApi } from '../../lib/api';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Star, 
  Trophy, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera
} from 'lucide-react';

const profileSchema = z.object({
  preferredSport: z.string().optional(),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Pro']).optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  age: z.number().min(13, 'Must be at least 13 years old').max(100).optional(),
  position: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { id } = useParams();
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const isOwnProfile = !id || id === user?.id?.toString();
  const displayUser = user; // In a real app, you'd fetch the other user's profile
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      preferredSport: displayUser?.preferredSport || '',
      skillLevel: displayUser?.skillLevel || undefined,
      location: displayUser?.location || '',
      bio: displayUser?.bio || '',
      age: displayUser?.age || undefined,
      position: displayUser?.position || '',
    },
  });
  
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError('');
      const updatedUser = await userApi.updateProfile(data);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    try {
      const { avatarUrl } = await userApi.uploadAvatar(file);
      updateUser({ avatarUrl });
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setError('');
  };
  
  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden">
              {displayUser.avatarUrl ? (
                <img
                  src={displayUser.avatarUrl}
                  alt={displayUser.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100">
                  <UserIcon className="w-12 h-12 text-primary-600" />
                </div>
              )}
            </div>
            
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{displayUser.username}</h1>
                <p className="text-gray-600 flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{displayUser.location || 'Location not set'}</span>
                </p>
              </div>
              
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {displayUser.skillLevel || 'Not set'}
                </div>
                <div className="text-sm text-gray-600">Skill Level</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {displayUser.ratingAverage ? displayUser.ratingAverage.toFixed(1) : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {displayUser.ratingCount || 0}
                </div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {displayUser.preferredSport || 'Any'}
                </div>
                <div className="text-sm text-gray-600">Sport</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-800">{success}</div>
        </div>
      )}
      
      {/* Profile Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Details</h2>
        
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Sport
                </label>
                <input
                  {...register('preferredSport')}
                  type="text"
                  className="mt-1 input"
                  placeholder="e.g., Soccer, Basketball"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Skill Level
                </label>
                <select {...register('skillLevel')} className="mt-1 input">
                  <option value="">Select skill level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Pro">Pro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  {...register('location')}
                  type="text"
                  className="mt-1 input"
                  placeholder="e.g., New York, NY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  min="13"
                  max="100"
                  className="mt-1 input"
                  placeholder="Your age"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Position
                </label>
                <input
                  {...register('position')}
                  type="text"
                  className="mt-1 input"
                  placeholder="e.g., Forward, Midfielder, Goalkeeper"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="mt-1 input"
                placeholder="Tell others about yourself, your playing style, or experience..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Sport</label>
                <p className="mt-1 text-sm text-gray-900">{displayUser.preferredSport || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <p className="mt-1 text-sm text-gray-900">{displayUser.age || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <p className="mt-1 text-sm text-gray-900">{displayUser.position || 'Not specified'}</p>
              </div>
            </div>
            
            {displayUser.bio && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{displayUser.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}