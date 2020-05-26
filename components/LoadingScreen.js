/**
 * Loading screen component which is shown when app is processing user sign in to Google, or
 * whether or not user is already signed into Google. After this loading screen, upon
 * successful sign in, the user will be redirected to the Genre selection page.
 */
import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator, Button } from 'react-native';
import firebase from 'firebase';

class LoadingScreen extends Component {
    componentDidMount() {
        this.checkIfLoggedIn();
    }

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.props.navigation.navigate("GoogleCalendarInput");
            } else {
                this.props.navigation.navigate("GoogleLogin")

            }
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
                <Button title="Sign out of Google" onPress={() => firebase.auth().signOut()} />
            </View>
        );
    }
}

export default LoadingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})