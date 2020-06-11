import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";

import store from "./store";
import AuthScreen from "./components/AuthScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import Timeline from "./components/Timeline";
import Genre from "./components/Genre";
import Finalized from "./components/Finalized";
import GoogleCalendarInput from "./components/GoogleCalendarInput";
import DateSelection from "./components/DateSelection";
import FriendInput from "./components/FriendInput";
import { YellowBox } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// might use tab navigator and define a static property
// to allow other test facebook email go to fb expo roles to add
// cover up bottom screens

/**
 * Current flow Welcome, Auth, Timeline. Timeline screen has no option to go back. Need to add
 * forward button on timeline screen to access genre page
 */
const MainNavigator = () => {
    YellowBox.ignoreWarnings(["Setting a timer"]);
    return (
        <Stack.Navigator>
            {/* <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: null }} /> */}
            <Stack.Screen name="Auth" component={AuthScreen} options={{ title: null }} />
            <Stack.Screen
                name="Timeline"
                component={Timeline}
                options={{ title: null }}
            />
            <Stack.Screen name="Genre" component={Genre} options={{ title: null }} />
            <Stack.Screen name="Finalized" component={Finalized} options={{ title: null }} />
            <Stack.Screen
                name="GoogleCalendarInput"
                component={GoogleCalendarInput}
                options={{ title: null }}
            />
            <Stack.Screen name="DateSelection" component={DateSelection} options={{ title: null }} />
            <Stack.Screen name="FriendInput" component={FriendInput} options={{ title: null }} />
        </Stack.Navigator>
    );
};

export default function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <MainNavigator />
            </NavigationContainer>
        </Provider>
    );
}
