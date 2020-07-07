import React from "react";
import Timeline from "react-native-timeline-flatlist";
import { Text, Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import ActionOptions from "./ActionOptions";
import {
    handleProcess,
    formatEventsData,
} from "../../reusable-functions/GoogleCalendarInvite";
import {
    handleRipple,
    objectFormatter,
} from "../../reusable-functions/data_timeline";
import moment from "moment-timezone";
import firebase from "../../database/firebase";
import TransitRoutes from "./TransitRoutes";
const Schedule = ({
    navigation,
    data,
    allEvents,
    mapUpdate,
    initRoutes,
    genres,
    accessRights,
    userID,
}) => {
    const [events, setEvents] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [unsatisfied, setUnsatisfied] = React.useState("");
    const [timingsArray, setTimingsArray] = React.useState([]);
    const [routes, setRoutes] = React.useState([]);

    React.useEffect(() => {
        let formatData = [];
        for (i = 0; i < data[0].length; i++) {
            const dataObj = data[0][i];
            const startTime = dataObj.startTime;
            const event = dataObj.event;
            const genre = dataObj.genre;
            formatData.push(objectFormatter(startTime, event, genre));
        }
        setRoutes(initRoutes);
        setEvents(formatData);
        setTimingsArray(data[1]);
    }, []);
    const routeUpdate = (selected, unsatisfied) => {
        let temp = routes;
        const result = temp.map((item) => {
            return item == unsatisfied.location ? selected.location : item;
        });
        setRoutes(result);
    };
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
        routeUpdate(selected, unsatisfied);
    };

    const onClose = () => {
        setVisible(false);
    };

    const onEventPress = (event) => {
        if (accessRights === "host") {
            setUnsatisfied(event);
            setVisible(true);
        } else {
            alert("Only the host can edit events");
        }
    };
    const newTimeChange = (selectedDate) => {
        const currentDate = selectedDate || newTime;
        let newStartTime = moment(currentDate)
            .tz("Asia/Singapore")
            .format("HH:mm");
        let i = 0;
        let newTimingsArray = timingsArray;

        let indexFinder = events.map((item, index) => {
            if (item === unsatisfied) {
                i = index;
                return { ...item, time: newStartTime };
            } else {
                return item;
            }
        });
        newTimingsArray = handleRipple(newTimingsArray, newStartTime, i);

        let updatedData = indexFinder.map((item, index) => {
            return { ...item, time: newTimingsArray[index].start };
        });

        console.log(newTimingsArray);
        setTimingsArray(newTimingsArray);
        setEvents(updatedData);
        setVisible(false);
    };

    const renderProceedButton = () => {
        if (accessRights != "host") {
            return;
        } else {
            return (
                <TouchableOpacity onPress={sendGcalInviteAndResetAttendeeData}>
                    <Text style={styles.proceed}>Proceed</Text>
                </TouchableOpacity>
            );
        }
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
        let updates = {};
        updates["/users/" + userID + "/busy_periods"] = null;

        firebase.database().ref().update(updates);
        navigation.navigate("Home"); // navigate back once done
    };

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
            <TransitRoutes routes={routes} />
            <View style={styles.footer}>{renderProceedButton()}</View>
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
    },
    footer: {
        flex: 1,
        alignItems: "center",
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
