import React, { Component } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { connect } from 'react-redux';

class DateSelection extends Component {
    render() {
        return (
            <View style={styles.container}>

            </View>
        );
    }
}

export default connect()(DateSelection);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    }
})