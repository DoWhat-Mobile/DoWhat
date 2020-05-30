import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import * as Facebook from 'expo-facebook';
import firebase from 'firebase';
import { firebaseConfig } from './database/firebase';

import store from './store';
import AuthScreen from './components/AuthScreen';
import WelcomeScreen from './components/WelcomeScreen';
import Timeline from './components/Timeline';
import Genre from './components/Genre';
import Finalized from './components/Finalized';
import GoogleCalendarInput from './components/GoogleCalendarInput';
import LoadingScreen from './components/LoadingScreen';
import GoogleLogin from './components/GoogleLogin';
import ExtractGcalAvails from './components/ExtractGcalAvails';
import DateSelection from './components/DateSelection';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator()

// might use tab navigator and define a static property
// to allow other test facebook email go to fb expo roles to add
// cover up bottom screens

/**
 * Current flow Welcome, Auth, Timeline. Timeline screen has no option to go back. Need to add 
 * forward button on timeline screen to access genre page
 */
const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Welcome' component={WelcomeScreen} />
      <Stack.Screen name='Auth' component={AuthScreen} />
      <Stack.Screen name='Timeline' component={Timeline} options={{ headerLeft: null }} />
      <Stack.Screen name='Genre' component={Genre} />
      <Stack.Screen name='Finalized' component={Finalized} />
      <Stack.Screen name='GoogleCalendarInput' component={GoogleCalendarInput} />
      <Stack.Screen name='LoadingScreen' component={LoadingScreen} />
      <Stack.Screen name='GoogleLogin' component={GoogleLogin} />
      <Stack.Screen name='ExtractGcalAvails' component={ExtractGcalAvails} />
      <Stack.Screen name='DateSelection' component={DateSelection} />
    </Stack.Navigator>

  );
};

firebase.initializeApp(firebaseConfig);

export default function App() {
  Facebook.initializeAsync('710198546414299', 'AuthTest');

  return (
    <Provider store={store}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </Provider>
  );
}
