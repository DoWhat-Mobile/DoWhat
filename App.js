import * as React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider } from "react-redux";
import * as Facebook from "expo-facebook";

import store from "./store";
import AuthScreen from "./components/AuthScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import Timeline from "./components/Timeline";
import Genre from "./components/Genre";
import Finalized from "./components/Finalized";

const Tab = createBottomTabNavigator();

// might use tab navigator and define a static property
// to allow other test facebook email go to fb expo roles to add
// cover up bottom screens
const mainFlow = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Timeline" component={Timeline} />
      <Tab.Screen name="Genre" component={Genre} />
      <Tab.Screen name="Finalized" component={Finalized} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Welcome" component={WelcomeScreen} />
      <Tab.Screen name="Auth" component={AuthScreen} />
      <Tab.Screen name="mainFlow" component={mainFlow} />
    </Tab.Navigator>
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
