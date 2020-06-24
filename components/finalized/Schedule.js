import React from "react";
import { connect } from "react-redux";
import Timeline from "react-native-timeline-flatlist";
import { Text, Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import ActionOptions from "./ActionOptions";
import {
    handleProcess,
    formatEventsData,
    handleBoardRouteProcess
} from "../../reusable-functions/GoogleCalendarInvite";
import moment from "moment-timezone";

const Schedule = ({ navigation, data, allEvents, mapUpdate, genres, board, userID }) => {
    const [events, setEvents] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [unsatisfied, setUnsatisfied] = React.useState("");
    const [timingsArray, setTimingsArray] = React.useState([]);
    const [newTime, setTime] = React.useState(
        new Date(Date.parse("2020-01-01T" + "13" + ":00:00.000+08:00"))
    );

    React.useEffect(() => {
        setEvents(data[0]);
        setTimingsArray(data[1]);
    }, []);

    const onReselect = (selected) => {
        const updatedData = events.map((item) => {
            if (item === unsatisfied) return selected;
            return item;
        });
        const updatedCoord = updatedData.map((item) => {
            const obj = { coord: item.coord, name: item.title };
            return obj;
        });
        setEvents(updatedData);
        mapUpdate(updatedCoord);
    };

    const onClose = () => {
        setVisible(false);
    };

    const onEventPress = (event) => {
        setUnsatisfied(event);
        setVisible(true);
    };

    const newTimeChange = (selectedDate) => {
        const currentDate = selectedDate || newTime;
        let val = moment(currentDate).tz("Asia/Singapore").format("HH:mm");
        let i = 0;
        let newTimingsArray = timingsArray;

        const updatedData = events.map((item, index) => {
            if (item === unsatisfied) {
                i = index;
                return { ...item, time: val };
            } else {
                return item;
            }
        });

        newTimingsArray[i].start = val;
        setTimingsArray(newTimingsArray);
        setEvents(updatedData);
        setVisible(false);
    };

    /**
     * Sends invite to all attendees of the finalized event, also reset all_attendee
     * in the case of repeated use of app. (if never reset data, might use it for wrong
     * date)
     */
    const sendGcalInviteAndResetAttendeeData = async () => {
        const formattedData = formatEventsData(events); // Formatted data contains event title
        if (board == null) { // Means route didnt come from collaborative board
            await handleProcess(formattedData, timingsArray);
            navigation.navigate("Feed");

        } else { // Come from collaborative board
            await handleBoardRouteProcess(formattedData, timingsArray, board)
            navigation.navigate("Feed");

        }
        alert("A calendar event has been created for you, and a calendar invite has been sent to all invitees");
    };

    // Only show proceed button for the host of the board, or if this page did not come from the collab board route
    const renderProceedButton = () => {
        if (board == null || board.boardID == userID) { // Did not come from collab board route
            return (
                <TouchableOpacity onPress={sendGcalInviteAndResetAttendeeData}>
                    <Text style={styles.proceed}>Proceed</Text>
                </TouchableOpacity>
            )
        }
        return; // If not, dont render a button
    }

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <Modal animated visible={visible} animationType="fade">
                    <ActionOptions
                        onReselect={onReselect}
                        onClose={onClose}
                        unsatisfied={unsatisfied}
                        events={allEvents}
                        genres={genres}
                        newTime={newTime}
                        newTimeChange={newTimeChange}
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
                {renderProceedButton()}
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

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID
    };
};

export default connect(mapStateToProps, null)(Schedule);