import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AllPlans from './AllPlans';
import Friends from './Friends';

const Drawer = createDrawerNavigator();

/**
 * Main screen under planning page which consists of a friends tab and a "all plans" tab.
 */
const PlanningScreen = (props) => {
    return (
        <Drawer.Navigator initialRouteName="Home">
            <Drawer.Screen name="All Plans" component={AllPlans} />
            <Drawer.Screen name="Friends" component={Friends} />
        </Drawer.Navigator>
    )
}

export default PlanningScreen;