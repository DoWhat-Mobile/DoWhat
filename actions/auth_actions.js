import { AsyncStorage } from "react-native";
import * as Facebook from "expo-facebook";

import { FACEBOOK_LOGIN_SUCCESS, FACEBOOK_LOGIN_FAIL } from "./types";

/**
 * checks for token, if it exists, set it to global state token, else render facebook login popup
 */
export const facebookLogin = () => async (dispatch) => {
  let token = await AsyncStorage.getItem("fb_token");
  if (token) {
    dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
  } else {
    doFacebookLogin(dispatch);
  }
};

/**
 * check if user has logged in before or not
 */
export const isLoggedIn = () => async (dispatch) => {
  let token = await AsyncStorage.getItem("fb_token");
  if (token) {
    dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
  } else {
    return dispatch({ type: FACEBOOK_LOGIN_FAIL });
  }
};

/**
 * faecbook login set up, if user authorizes account, token will be created in asyncstorage
 * @param {*} dispatch 
 */
const doFacebookLogin = async (dispatch) => {
  let { type, token } = await Facebook.logInWithReadPermissionsAsync(
    "710198546414299",
    {
      permissions: ["public_profile"],
    }
  );
  if (type === "cancel") {
    return dispatch({ type: FACEBOOK_LOGIN_FAIL });
  }

  await AsyncStorage.setItem("fb_token", token);
  dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
};
