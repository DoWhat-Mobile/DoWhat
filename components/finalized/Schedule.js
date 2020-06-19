import React from "react";
import Timeline from "react-native-timeline-flatlist";
import { data_timeline } from "../../reusable-functions/data_timeline";
import { Text, Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import ShuffleModal from "./ShuffleModal";
import {
    handleProcess,
    formatEventsData,
} from "../../reusable-functions/GoogleCalendarInvite";

const Schedule = ({ navigation, data, allEvents }) => {
    const [events, setEvents] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [unsatisfied, setUnsatisfied] = React.useState("");
    const [timingsArray, setTimingsArray] = React.useState([]);

    React.useEffect(() => {
        setEvents(data[0]);
        setTimingsArray(data[1]);
    }, []);

    const onReselect = (selected) => {
        const updatedData = events.map((item) => {
            if (item === unsatisfied) return selected;
            return item;
        });
        setEvents(updatedData);
    };

    const onClose = () => {
        setVisible(false);
    };

    const onEventPress = (event) => {
        setUnsatisfied(event);
        setVisible(true);
    };

    /**
     * Sends invite to all attendees of the finalized event, also reset all_attendee
     * in the case of repeated use of app. (if never reset data, might use it for wrong
     * date)
     */
    const sendGcalInviteAndResetAttendeeData = async () => {
        const formattedData = formatEventsData(events); // Formatted data contains event title
        // handleProcess function and all other logic is in GoogleCalendarInvite.js
        await handleProcess(formattedData, timingsArray);
        navigation.navigate("Home"); // navigate back once done
    };

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <Modal animated visible={visible} animationType="fade">
                    <ShuffleModal
                        onReselect={onReselect}
                        onClose={onClose}
                        unsatisfied={unsatisfied}
                        events={allEvents}
                    />
                </Modal>
                <Timeline
                    onEventPress={(event) => onEventPress(event)}
                    data={events}
                    timeStyle={{
                        textAlign: "center",
                        backgroundColor: "#ff9797",
                        color: "white",
                        padding: 5,
                        borderRadius: 13,
                    }}
                />
            </View>
            <View style={styles.footer}>
                <TouchableOpacity onPress={sendGcalInviteAndResetAttendeeData}>
                    <Text style={styles.proceed}>Proceed</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 10,
        padding: 20,
        paddingTop: 65,
        backgroundColor: "white",
    },
    footer: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "white",
    },
    proceed: {
        borderWidth: 0.5,
        marginBottom: "5%",
        paddingTop: "1%",
        paddingBottom: "1%",
        paddingLeft: "20%",
        paddingRight: "20%",
        borderRadius: 5,
    },
});

export default Schedule;
