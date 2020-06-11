/**
 * THIS SCREEN IS NOT IN USE CURRENTLY. NAVIGATES STRAIGHT TO AUTHSCREEN 
 */
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { connect } from "react-redux";
import Slides from "./Slides";
import { YellowBox } from "react-native";


const WelcomeScreen = (props) => {
    YellowBox.ignoreWarnings(["Setting a timer"]);

    const data = [
        { text: "Welcome to DoWhat" },
        { text: "Choose your timings" },
        { text: "Select your genre" },
        { text: "Get your finalized timeline" },
    ];

    /**
     * after reaching the last slide, direct to Auth page
     */
    const onSlidesComplete = () => {
        props.navigation.navigate("Auth");
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text>Hi</Text>
            </View>

            <View style={styles.body}>
                <Text>Hi</Text>
            </View>

            <View style={styles.footer}>
                <Text>Hi</Text>
                <Button title="Let's get started" onPress={() => onSlidesComplete()} />
            </View>

        </View >
    );
};

export default connect()(WelcomeScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        backgroundColor: 'blue',
    },
    body: {
        flex: 5,
        backgroundColor: 'yellow',
    },
    footer: {
        flex: 1,
        backgroundColor: 'pink',
    },
});