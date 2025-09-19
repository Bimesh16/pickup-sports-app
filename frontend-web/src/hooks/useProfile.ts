import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@lib/http';

export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  skillLevel?: string;
  age?: number;
  position?: string;
  contactPreference?: string;
  phone?: string;
  gender?: string;
  nationality?: string;
  xp?: number;
  level?: number;
  rank?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  preferredSports?: string[];
  privacySettings?: any;
  securitySettings?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  skillLevel?: string;
  age?: number;
  position?: string;
  contactPreference?: string;
  phone?: string;
  gender?: string;
  nationality?: string;
  preferredSports?: string[];
  privacySettings?: any;
  securitySettings?: any;
}

export function useProfile() {
  return useQuery({
    queryKey: ['me', 'profile'],
    queryFn: () => http<User>('/profiles/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['me', 'profile', 'update'],
    mutationFn: (data: UpdateProfileRequest) => 
      http<User>('/profiles/me', { 
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['me', 'profile'] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<User>(['me', 'profile']);

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<User>(['me', 'profile'], {
          ...previousProfile,
          ...newData,
          updatedAt: new Date().toISOString(),
        });
      }

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProfile) {
        queryClient.setQueryData(['me', 'profile'], context.previousProfile);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['me', 'avatar', 'upload'],
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return http<{ avatarUrl: string }>('/profiles/me/avatar', {
        method: 'PUT',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
    },
    onSuccess: (data: { avatarUrl: string }) => {
      // Update the profile cache with the new avatar URL
      queryClient.setQueryData<User>(['me', 'profile'], (old) => 
        old ? { ...old, avatarUrl: data.avatarUrl } : old
      );
    },
  });
}