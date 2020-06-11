/**
 * Welcome screen, without FB authentication anymore.
 */
import React from "react";
import { View, Text, Button } from "react-native";
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
        <View>
            <Slides data={data} onSlidesComplete={onSlidesComplete} />
        </View>
    );
};

export default connect()(WelcomeScreen);