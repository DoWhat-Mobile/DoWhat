/**
 * Welcome screen, without FB authentication anymore. 
 */
import React from "react";
import { View, Text, AsyncStorage } from "react-native";
import { AppLoading } from "expo";
import { connect } from "react-redux";
import * as actions from "../actions";
import Slides from "./Slides";

const WelcomeScreen = (props) => {
  const data = [
    { text: "Welcome to DoWhat" },
    { text: "Choose your timings" },
    { text: "Select your genre" },
    { text: "Get your finalized timeline" },
  ];

  /**
   * after reaching the last slide, direct to Auth page
   */
  onSlidesComplete = () => {
    props.navigation.navigate("Auth");
  };

  return (
    <View>
      <Slides data={data} onSlidesComplete={onSlidesComplete} />
    </View>
  );
};

export default connect()(WelcomeScreen);
