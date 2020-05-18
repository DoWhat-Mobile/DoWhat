import React from "react";
import { View, Text, AsyncStorage } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";

const AuthScreen = (props) => {
  React.useEffect(() => {
    props.facebookLogin();
    //AsyncStorage.removeItem("fb_token");
    onAuthComplete(props);
  });

  const onAuthComplete = (props) => {
    if (props.token) {
      props.navigation.navigate("Timeline");
    }
  };
  return (
    <View>
      <Text>AuthScreen</Text>
      <Text>AuthScreen</Text>
      <Text>AuthScreen</Text>
      <Text>AuthScreen</Text>
      <Text>AuthScreen</Text>
    </View>
  );
};

function mapStateToProps({ auth }) {
  return { token: auth.token };
}

export default connect(mapStateToProps, actions)(AuthScreen);
