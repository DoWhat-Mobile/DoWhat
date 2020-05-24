import React from "react";
import { View, Text, AsyncStorage, Button, StyleSheet } from "react-native";
import { connect } from "react-redux";

/**
 * Page for first step of application flow: Uploading of google calendar to get free timings
 * If a user does not want to upload google calendar, the user will skip and move on to manual
 * input of free timings instead.
 */
class SyncGoogleCalendar extends React.Component {
    render() {
        return (
            <View>
                <Button title="Skip"
                    onPress={() => this.props.navigation.navigate("Timeline")} />
            </View>
        );
    }
}

export default connect()(SyncGoogleCalendar);

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        flexDirection: 'column',
        alignItems: "center"
    },

});