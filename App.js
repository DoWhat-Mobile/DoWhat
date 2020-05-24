import * as React from "react";
import { Text, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from "react-redux";
import * as Facebook from "expo-facebook";

import store from "./store";
import AuthScreen from "./components/AuthScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import Timeline from "./components/Timeline";
import Genre from "./components/Genre";
import Finalized from "./components/Finalized";
import SyncGoogleCalendar from "./components/SyncGoogleCalendar";

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
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Timeline" component={Timeline} options={{ headerLeft: null }} />
      <Stack.Screen name="Genre" component={Genre} />
      <Stack.Screen name="Finalized" component={Finalized} />
      <Stack.Screen name="SyncGoogleCalendar" component={SyncGoogleCalendar} />
    </Stack.Navigator>

  );
};

export default function App() {
  Facebook.initializeAsync("710198546414299", "AuthTest");

  return (
    <Provider store={store}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </Provider>
  );
}
