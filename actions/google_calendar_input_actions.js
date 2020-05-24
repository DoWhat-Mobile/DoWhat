import { AsyncStorage } from 'react-native';
import * as Google from 'expo-google-app-auth';

export const googleLogin = () => async (dispatch) => {
    try {
        const result = await Google.logInAsync({
            androidClientId: '119205196255-0hi8thq9lm1759jr8k5o1ld8h239olr5.apps.googleusercontent.com',
            iosClientId: '119205196255-ofp61a7qv7g38812gmafsdo37si7l4q5.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
        });

        if (result.type === 'success') {
            console.log("Google login successful")
            console.log(result.accessToken)
            dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: result.accessToken });
        } else {
            return { cancelled: true };
        }
    } catch (e) {
        return { error: true };
    }
}