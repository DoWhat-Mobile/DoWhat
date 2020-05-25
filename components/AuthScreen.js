import React from "react";
import { View, Text, AsyncStorage, TouchableOpacity, Image, StyleSheet } from "react-native";
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
      <Text>Login Screen</Text>
      <View style={style.icons}>
        <TouchableOpacity onPress={() => loginToFacebook()}>
          <Image source={require('../assets/facebook.png')} style={style.facebook} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => props.navigation.navigate("LoadingScreen")}>
          <Image source={require('../assets/google.png')} stlye={style.google} />
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity onPress={() => props.navigation.navigate("GoogleCalendarInput")} >
          <Text style={{ color: 'blue' }}>Proceed Without Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

};

function mapStateToProps({ auth }) {
  return { token: auth.token };
}

export default connect(mapStateToProps, actions)(AuthScreen);

const style = StyleSheet.create({
  google: {
    resizeMode: 'contain',

  },
  facebook: {
    width: 40,
    height: 40,
  },
  icons: {
    flexDirection: "row",
    justifyContent: 'center'
  }
})