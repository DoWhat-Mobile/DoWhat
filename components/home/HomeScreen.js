import React from "react";
import { connect } from "react-redux";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Feed from './Feed';
import Plan from '../collaboration/AllPlans';
import Friends from './Friends';

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
                params={{ addingFavourite: false }}
                style={{ borderWidth: 1, backgroundColor: 'blue' }}
                options={{
                    tabBarLabel: 'Plan',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="feature-search" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Friends"
                component={Friends}
                style={{ borderWidth: 1, backgroundColor: 'blue' }}
                options={{
                    tabBarLabel: 'Friends',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" color={color} size={size} />
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