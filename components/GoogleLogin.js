/**
 * Login page for users to log into Google if they have not done so already.
 */
import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';

class GoogleLogin extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Google Login</Text>
            </View>

        );
    }
}

export default GoogleLogin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})