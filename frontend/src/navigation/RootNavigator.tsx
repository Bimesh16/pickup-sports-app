import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '@/stores/authStore';
import AuthNavigator from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoadingScreen } from '@/screens/LoadingScreen';

const Stack = createStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  console.log('RootNavigator state:', { isAuthenticated, isLoading, user: user?.name });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
