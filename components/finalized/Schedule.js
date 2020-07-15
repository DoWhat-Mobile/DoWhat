import React from "react";
import ActionOptions from "./ActionOptions";
import Timeline from "react-native-timeline-flatlist";
import moment from "moment-timezone";
import firebase from "../../database/firebase";
import TransitRoutes from "./TransitRoutes";

import {
    Text,
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";

import {
    handleProcess,
    formatEventsData,
    handleBoardRouteProcess,
} from "../../reusable-functions/GoogleCalendarInvite";
import {
    handleRipple,
    renderDetail,
    merge,
    eventsWithDirections,
} from "../../reusable-functions/data_timeline";
import { timing } from "react-native-reanimated";

//  navigation,
//     data,
//     allEvents,
//     mapUpdate,
//     initRoutes,
//     genres,
//     accessRights,
//     userID,
//     route,
//     board,   For board route, will be undefined for other route
const Schedule = (props) => {
    const [events, setEvents] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [unsatisfied, setUnsatisfied] = React.useState("");
    //const [timingsArray, setTimingsArray] = React.useState([]);
    const [isLoading, setLoading] = React.useState(true);

    React.useEffect(() => {
        //let updatedTimings = merge(props.timings, props.initRoutes);
        let combinedData = eventsWithDirections(
            props.timings,
            props.data,
            props.initRoutes
        );
        console.log("Updated Events are", combinedData);
        console.log("Passed data is", props.data);
        //console.log("Updated Timings are ", updatedTimings);
        //setTimingsArray(updatedTimings);
        setEvents(combinedData);
        setLoading(false);
    }, [props.initRoutes]);

    const onReselect = (selected) => {
        const updatedData = events.map((item) => {
            if (item === unsatisfied) {
                return selected;
            } else {
                return item;
            }
        });
        const filteredData = updatedData.filter(
            (item) => item.genre !== "directions"
        );
        const updatedCoord = updatedData.reduce((acc, item) => {
            if (item.genre !== "directions") {
                acc.push({ coord: item.coord, name: item.title });
            }
            return acc;
        }, []);

        props.eventsUpdate(filteredData);
        props.mapUpdate(updatedCoord);
        props.routeUpdate(selected, unsatisfied);
    };

    const onClose = () => {
        setVisible(false);
    };

    const onEventPress = (event) => {
        if (event.genre == "directions") {
            return;
        }
        if (props.accessRights === "host" && event.genre !== "directions") {
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
        let newTimingsArray = props.timings;

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

        props.setTimingsArray(newTimingsArray);
        setEvents(updatedData);
        setVisible(false);
    };

    const renderProceedButton = () => {
        if (props.accessRights != "host") {
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
        if (props.route == "board") {
            // collab board route
            // Create calendar event and send calendar invite to invitees
            await handleBoardRouteProcess(
                formattedData,
                props.timings,
                props.board
            );
        } else {
            // handleProcess function and all other logic is in GoogleCalendarInvite.js
            await handleProcess(formattedData, props.timings);
        }
        let updates = {};
        updates["/users/" + props.userID + "/busy_periods"] = null;

        firebase.database().ref().update(updates);
        props.navigation.navigate("Home"); // navigate back once done
        alert(
            "A calendar event has been created for you, and calendar invite sent to your friends."
        );
    };

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator
                    style={{ alignSelf: "center" }}
                    size="large"
                />
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <Modal animated visible={visible} animationType="fade">
                        <ActionOptions
                            onReselect={onReselect}
                            onClose={onClose}
                            unsatisfied={unsatisfied}
                            events={props.allEvents}
                            genres={props.genres}
                            newTimeChange={newTimeChange}
                            filters={props.filters}
                        />
                    </Modal>
                    <Timeline
                        onEventPress={(event) => onEventPress(event)}
                        data={events}
                        timeStyle={{
                            textAlign: "center",
                            backgroundColor: "#cc5327",
                            color: "white",
                            padding: 5,
                            borderRadius: 13,
                        }}
                        // detailContainerStyle={{
                        //     marginBottom: 20,
                        //     paddingLeft: 15,
                        //     paddingRight: 15,
                        //     backgroundColor: "white",
                        //     borderRadius: 20,
                        // }}
                        renderDetail={renderDetail}
                        circleColor="black"
                    />
                </View>
                {/* <TransitRoutes routes={routes} /> */}
                <View style={styles.footer}>{renderProceedButton()}</View>
            </View>
        );
    }
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
        marginVertical: 30,
        marginLeft: 200,
    },
    proceed: {
        //borderWidth: 0.5,
        paddingTop: "3%",
        paddingBottom: "3%",
        paddingLeft: "15%",
        paddingRight: "15%",
        borderRadius: 20,
        fontSize: 18,
        fontWeight: "bold",
        color: "#fcf5f2",
        backgroundColor: "#cc5327",
    },
});

export default Schedule;
