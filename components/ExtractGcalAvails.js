import React, { Component } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { connect } from 'react-redux';
import * as Linking from 'expo-linking';

const ExtractGcalAvails = (props) => {
    return (
        <View style={style.container}>
            <Button title='Linking'
                onPress={() => Linking.openURL(Linking.makeUrl())} />
            <Button title='Get this URL'
                onPress={() => alert(Linking.makeUrl())} />
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