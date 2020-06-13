/**
 * THIS SCREEN IS NOT IN USE CURRENTLY. NAVIGATES STRAIGHT TO AUTHSCREEN 
 */
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { YellowBox } from "react-native";


const HomeScreen = (props) => {
    YellowBox.ignoreWarnings(["Setting a timer"]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text>Hi</Text>
            </View>

            <View style={styles.body}>
                <Text style={{ textAlign: "center" }}>This will be the feed</Text>
            </View>

            <View style={styles.footer}>
                <Text>Hi</Text>
                <Button title="Let's get started" onPress={() => props.navigation.navigate("DateSelection")} />
            </View>

        </View >
    );
};

export default connect()(HomeScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        backgroundColor: 'blue',
    },
    body: {
        flex: 7,
        justifyContent: 'center',
    },
    footer: {
        flex: 1,
        backgroundColor: 'pink',
    },
});