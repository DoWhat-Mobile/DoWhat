/**
 * THIS SCREEN IS NOT IN USE CURRENTLY. NAVIGATES STRAIGHT TO AUTHSCREEN 
 */
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Feed from './Feed';
import Explore from './Explore';

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

            {/*
            <Tab.Screen
                name="Notifications"
                component={Notifications}
                options={{
                    tabBarLabel: 'Updates',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bell" color={color} size={size} />
                    ),
                }}
            /> 
            */}

            <Tab.Screen
                name="Explore"
                component={Explore}
                options={{
                    tabBarLabel: 'Explore',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="feature-search" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const HomeScreen = (props) => {
    return (
        <MyTabs />
    );
};

export default connect()(HomeScreen);