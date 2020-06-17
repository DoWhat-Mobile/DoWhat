/**
 * THIS SCREEN IS NOT IN USE CURRENTLY. NAVIGATES STRAIGHT TO AUTHSCREEN 
 */
import React from "react";
import { connect } from "react-redux";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from '../../database/firebase';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Feed from './Feed';
import Plan from './Planning';

const Tab = createBottomTabNavigator();

const MyTabs = (props) => {
    return (
        <Tab.Navigator
            initialRouteName="Feed"
            tabBarOptions={{
                activeTintColor: '#e91e63',
            }}
        >
            <Tab.Screen
                name="Feed"
                component={Feed}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Plan"
                component={Plan}
                options={{
                    tabBarLabel: 'Plan',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="feature-search" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const HomeScreen = (props) => {
    // Get user's push token from here
    React.useEffect(() => {
        const fetchData = async () => {
            const userId = await firebase.auth().currentUser.uid;
            await registerForPushNotificationsAsync(userId);
        }
        fetchData();
    }, []);

    // Get push token and set it in the user's Firebase node
    const registerForPushNotificationsAsync = async (userId) => {
        if (Constants.isDevice) {
            const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            try {
                let token = await Notifications.getExpoPushTokenAsync();
                console.log("Expo notif token is: ", token);
                firebase.database().ref('users/' + userId)
                    .child("push_token")
                    .set(token);

            } catch (err) {
                console.log("Error putting user's expo notif token to Firebase", err);
            }

        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('default', {
                name: 'default',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });
        }
    };

    return (
        <MyTabs />
    );
};

export default connect()(HomeScreen);