import React from "react";
import ActionOptions from "./ActionOptions";
import Timeline from "react-native-timeline-flatlist";
import moment from "moment-timezone";
import firebase from "../../database/firebase";
import TransitRoutes from "./TransitRoutes";
import { GOOGLE_MAPS_API_KEY } from "react-native-dotenv";

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
    routeFormatter,
    renderDetail,
} from "../../reusable-functions/data_timeline";

const Schedule = ({
    navigation,
    data,
    allEvents,
    mapUpdate,
    initRoutes,
    genres,
    accessRights,
    userID,
    route,
    board, // For board route, will be undefined for other route
}) => {
    const [events, setEvents] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [unsatisfied, setUnsatisfied] = React.useState("");
    const [timingsArray, setTimingsArray] = React.useState([]);
    const [directions, setDirections] = React.useState([]);
    const [isLoading, setLoading] = React.useState(true);

    React.useEffect(() => {
        //setRoutes(initRoutes);
        routesArray(initRoutes);
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

        // const updatedFirebase = eventsInFirebase.map(ite);
        setEvents(updatedData);
        mapUpdate(updatedCoord);
        routeUpdate(selected, unsatisfied);
    };

    const onClose = () => {
        setVisible(false);
    };

    const onEventPress = (event) => {
        if (accessRights === "host" && event.genre !== "direction") {
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
        if (route == "board") {
            // collab board route
            // Create calendar event and send calendar invite to invitees
            await handleBoardRouteProcess(formattedData, timingsArray, board);
        } else {
            // handleProcess function and all other logic is in GoogleCalendarInvite.js
            await handleProcess(formattedData, timingsArray);
        }
        let updates = {};
        updates["/users/" + userID + "/busy_periods"] = null;

        firebase.database().ref().update(updates);
        navigation.navigate("Home"); // navigate back once done
        alert(
            "A calendar event has been created for you, and calendar invite sent to your friends."
        );
    };

    const routesArray = async (allRoutes) => {
        let result = [];
        for (let i = 0; i < allRoutes.length - 1; i++) {
            let obj = [];
            let origin =
                typeof allRoutes[i] === "object"
                    ? allRoutes[i].lat + "," + allRoutes[i].long
                    : allRoutes[i];
            let destination = allRoutes[i + 1];
            try {
                let resp = await fetch(
                    "https://maps.googleapis.com/maps/api/directions/json?origin=" +
                        origin +
                        "&destination=" +
                        destination +
                        "&key=" +
                        GOOGLE_MAPS_API_KEY +
                        "&mode=transit&region=sg"
                );
                //console.log(JSON.stringify(await resp.json()));
                let response = (await resp.json())["routes"][0]["legs"][0][
                    "steps"
                ];
                for (let j = 0; j < response.length; j++) {
                    obj.push(await routeFormatter(await response[j]));
                }
            } catch (err) {
                console.log(err);
            }
            result.push(obj);
        }
        //}
        setDirections(result);
        setLoading(false);
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
        console.log(directions);
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
