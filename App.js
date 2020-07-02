import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { HeaderBackButton } from "@react-navigation/stack";
import { Provider } from "react-redux";

import store from "./store";
import AuthScreen from "./components/AuthScreen";
import HomeScreen from "./components/home/HomeScreen";
import Timeline from "./components/Timeline";
import Genre from "./components/genre/Genre";
import Finalized from "./components/finalized/Finalized";
import DateSelection from "./components/DateSelection";
import FriendInput from "./components/FriendInput";
import Loading from "./components/Loading";
import { YellowBox } from "react-native";

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
            <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{ title: null }}
            />
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: null }}
            />
            <Stack.Screen
                name="Timeline"
                component={Timeline}
                options={{ title: null }}
            />
            <Stack.Screen
                name="Genre"
                component={Genre}
                options={{ title: null }}
            />
            <Stack.Screen
                name="Finalized"
                component={Finalized}
                options={({ navigation }) => ({
                    title: null,
                    headerLeft: () => (
                        <HeaderBackButton
                            onPress={() => {
                                navigation.navigate("Genre");
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name="DateSelection"
                component={DateSelection}
                options={{ title: null }}
            />
            <Stack.Screen
                name="FriendInput"
                component={FriendInput}
                options={{ title: null }}
            />
            <Stack.Screen
                name="Loading"
                component={Loading}
                options={{ title: null }}
            />
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
