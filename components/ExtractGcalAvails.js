import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View, Button } from 'react-native';
import { connect } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import * as AppAuth from 'expo-app-auth';

const OAuthConfig = {
    issuer: 'https://accounts.google.com',
    clientId: '119205196255-0hi8thq9lm1759jr8k5o1ld8h239olr5.apps.googleusercontent.com', // From Google Dev Console credentials
    scopes: ['https://www.googleapis.com/auth/calendar'] // All available scopes for Gapi found here : https://developers.google.com/identity/protocols/oauth2/scopes#calendar
}

const ExtractGcalAvails = (props) => {
    const url = 'https://www.googleapis.com/calendar/v3/freeBusy?key=AIzaSyB3DcUhK37rpYdmO2C8_tKoM8-ugnlInaQ'
    const data = JSON.stringify({
        'timeMin': '2020-04-28T08:00:00+08:00',
        'timeMax': '2020-04-28T20:00:00+08:00',
        'timeZone': 'UTC+08:00',
        'items': [
            {
                'id': 'hansybastian@gmail.com'
            }
        ]
    })

    const getAvailableTimings = async (token) => {
        try {
            fetch(url, {
                method: 'POST',
                body: data,
                headers: new Headers({
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token.accessToken
                })
            })
                .then(response => response.json())
                .then(data => console.log(data))
        } catch (e) {
            console.log(e);
        }
    }

    const getGcalAuthorization = async () => {
        try {
            const tokenResponse = await AppAuth.authAsync(OAuthConfig);
            getAvailableTimings(tokenResponse);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <View style={style.container}>
            <ActivityIndicator size="large" />
            <Button title="Get Authorization" onPress={() => getGcalAuthorization()} />
        </View>
    );
}



const mapStateToProps = (state) => {
    return {
        access_token: state.access_token,
    }
}

export default connect(mapStateToProps)(ExtractGcalAvails);

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    }
})