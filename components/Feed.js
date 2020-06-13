import React from 'react';
import { View, Text, Button, StyleSheet } from "react-native";

const Feed = (props) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
            </View>

            <View style={styles.body}>
                <Text style={{ textAlign: "center" }}>This will be the feed</Text>
            </View>

            <View style={styles.footer}>
            </View>

        </View >
    );
}

export default Feed;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
    },
    body: {
        flex: 7,
        justifyContent: 'center',
    },
    footer: {
        flex: 1,
    },
});