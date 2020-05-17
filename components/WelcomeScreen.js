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

  onSlidesComplete = () => {
    props.navigation.navigate("Auth");
  };

  React.useEffect(() => {
    props.isLoggedIn();
    onAuthComplete(props);
  });

  const onAuthComplete = (props) => {
    if (props.token) {
      props.navigation.navigate("mainFlow");
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
