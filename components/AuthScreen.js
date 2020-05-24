import React from "react";
import { View, Text, AsyncStorage, Button } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";

const AuthScreen = (props) => {
  const loginToFacebook = () => {
    props.facebookLogin();
    AsyncStorage.removeItem("fb_token");
    onAuthComplete(props);
  };

  const onAuthComplete = (props) => {
    if (props.token) {
      props.navigation.navigate("GoogleCalendarInput");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>AuthScreen</Text>
      <Button title='Continue Wtihout Login'
        onPress={() => props.navigation.navigate("GoogleCalendarInput")} />
      <Button title="Login with Facebook"
        onPress={() => loginToFacebook()} />
    </View>
  );
};

function mapStateToProps({ auth }) {
  return { token: auth.token };
}

export default connect(mapStateToProps, actions)(AuthScreen);
