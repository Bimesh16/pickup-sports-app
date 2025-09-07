import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SimpleWelcomeScreen from '../screens/auth/SimpleWelcomeScreen';
import SimpleLoginScreen from '../screens/auth/SimpleLoginScreen';
import SignupWizard from '../screens/auth/SignupWizard';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import { AuthStackParamList } from '@/types';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Welcome" component={SimpleWelcomeScreen} />
      <Stack.Screen name="Login" component={SimpleLoginScreen} />
      <Stack.Screen name="Register" component={SignupWizard} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}