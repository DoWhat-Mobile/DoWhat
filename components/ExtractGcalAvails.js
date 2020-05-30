import React, { Component } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { connect } from 'react-redux';
import * as Linking from 'expo-linking';

const ExtractGcalAvails = (props) => {
    const shareWithTelegram = (url) => {
        Linking.openURL('https://t.me/share/url?url=' + url + '&text=Here is the link to input your' +
            'calendar availability!');
    }

    const shareWithWhatsapp = (url) => {
        Linking.openURL('whatsapp://send?' +
            'text=Here is the link to input your calendar availability!' +
            '')
    }

    return (
        <View style={style.container}>
            <Button title='Share with Telegram'
                onPress={() => shareWithTelegram(Linking.makeUrl())} />
            <Button title='Share with Whatsapp'
                onPress={() => shareWithWhatsapp(Linking.makeUrl())} />

        </View>
    );
}

export default connect()(ExtractGcalAvails);

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    }
})