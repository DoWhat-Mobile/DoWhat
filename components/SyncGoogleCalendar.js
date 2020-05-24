import React from "react";
import { View, Text, AsyncStorage, Button, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

/**
 * Page for first step of application flow: Uploading of google calendar to get free timings
 * If a user does not want to upload google calendar, the user will skip and move on to manual
 * input of free timings instead.
 */
class SyncGoogleCalendar extends React.Component {
    render() {
        return (
            <View style={style.container}>
                <View style={style.calendar}>
                    <FontAwesomeIcon icon={faCalendarAlt} size={80} />
                </View>
                <View>
                    <Text style={style.header}>Sync Google Calendar</Text>
                    <Text style={style.subHeader}>
                        Upload your Google calendar for automated planning
                    </Text>
                </View>
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
    calendar: {
        marginBottom: 50,
    },
    header: {
        fontSize: 32,
        color: '#7385d9',
        textAlign: "center",
    },
    subHeader: {
        fontSize: 16,
        color: '#7385d9',
        textAlign: "center",
    }

});