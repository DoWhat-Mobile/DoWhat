import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';

class ExtractGcalAvails extends Component {
    componentDidMount() {

    }

    render() {
        return (
            <View style={style.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
}

export default ExtractGcalAvails;

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    }
})