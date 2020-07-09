import {
    GOOGLE_ANDROID_CLIENT_ID,
    STANDALONE_GOOGLE_ANDROID_CLIENT_ID,
} from "react-native-dotenv";

/**
 * Used to get access token for API calls
 */
export const OAuthConfig = {
    issuer: "https://accounts.google.com",
    clientId: GOOGLE_ANDROID_CLIENT_ID, // use STANDALONE Client ID if using built expo app
    scopes: ["https://www.googleapis.com/auth/calendar", "profile", "email"],
};

export const checkIfTokenExpired = (accessTokenExpirationDate) => {
    return new Date(accessTokenExpirationDate) < new Date();
};