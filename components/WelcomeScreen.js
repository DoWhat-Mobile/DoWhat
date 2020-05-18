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

  React.useEffect(() => {
    props.isLoggedIn();
    //AsyncStorage.removeItem("fb_token");
    onAuthComplete(props);
  });

  /**
   * takes in global state token to check if token exists, if it does, navigate straight to Timeline
   * @param {*} props 
   */
  const onAuthComplete = (props) => {
    if (props.token) {
      props.navigation.navigate("Timeline");
    }
  };

  return (
    <View>
      <Slides data={data} onSlidesComplete={onSlidesComplete} />
    </View>
  );
};

function mapStateToProps({ auth }) {
  return { token: auth.token };
}
export default connect(mapStateToProps, actions)(WelcomeScreen);
