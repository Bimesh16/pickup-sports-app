import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesAPI } from '../services/api';

export const useGames = (filters?: any) => {
  return useQuery({
    queryKey: ['games', filters],
    queryFn: () => gamesAPI.getGames(filters),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useGame = (gameId: string) => {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gamesAPI.getGame(gameId),
    select: (response) => response.data,
    enabled: !!gameId,
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gamesAPI.createGame,
    onSuccess: () => {
      // Invalidate games list
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useJoinGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gameId: string) => gamesAPI.joinGame(gameId),
    onSuccess: (_, gameId) => {
      // Invalidate specific game and games list
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useConfirmGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gameId: string) => gamesAPI.confirmGame(gameId),
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useLeaveGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gameId: string) => gamesAPI.leaveGame(gameId),
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};