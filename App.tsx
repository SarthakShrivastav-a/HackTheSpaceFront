import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { View, Text, StyleSheet, Button } from 'react-native'; // Added Button component

import ManageData from './ManageData';
import Payments from './Payments';
import CreateAccount from './CreateAccount';
import UserProfile from './UserProfile';
import transferPage from './transferPage';
import SetOptions from './SetOptions';
enableScreens();

// Define the param list for the navigation stack
type RootStackParamList = {
  Home: undefined;
  ManageData: undefined;
  Payments: undefined;
  CreateAccount: undefined;
};

// Create the stack navigator
const Stack = createStackNavigator<RootStackParamList>();

// Define the Home screen component with navigation
const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Diamante App</Text>
      <Text style={styles.subtitle}>Select an option to proceed:</Text>
      
      <Button
        title="Manage Data"
        onPress={() => navigation.navigate('ManageData')}
      />
      <Button
        title="Set Options"
        onPress={() => navigation.navigate('SetOptions')}
      />
      <Button
        title="Payments"
        onPress={() => navigation.navigate('Payments')}
      />
      <Button
        title="Create Account"
        onPress={() => navigation.navigate('CreateAccount')}
      />
      <Button
        title="User Profile"
        onPress={() => navigation.navigate('UserProfile')}
      />
      <Button
        title="Transfer Page"
        onPress={() => navigation.navigate('transferPage')}
      />
    </View>
  );
};

// Styling for the HomeScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    marginBottom: 10,
  }
});

// Main App component
const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ManageData" component={ManageData} />
        <Stack.Screen name="Payments" component={Payments} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="transferPage" component={transferPage} />
        <Stack.Screen name="SetOptions" component={SetOptions} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
