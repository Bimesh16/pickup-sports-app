import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesApi } from '../lib/api';
import { Game, SearchFilters } from '../types';

export const useGames = (filters?: SearchFilters) => {
  return useQuery({
    queryKey: ['games', filters],
    queryFn: () => gamesApi.getGames(filters),
    staleTime: 30000, // 30 seconds
  });
};

export const useGame = (id: number) => {
  return useQuery({
    queryKey: ['games', id],
    queryFn: () => gamesApi.getGame(id),
    enabled: !!id,
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gamesApi.createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useJoinGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, captchaToken }: { id: number; captchaToken?: string }) =>
      gamesApi.joinGame(id, captchaToken),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['games', id] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useLeaveGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gamesApi.leaveGame,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['games', id] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Game> }) =>
      gamesApi.updateGame(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['games', id] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gamesApi.deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};