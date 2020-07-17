import React from "react";
import ActionOptions from "./ActionOptions";
import Timeline from "react-native-timeline-flatlist";
import moment from "moment-timezone";
import firebase from "../../database/firebase";
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
    renderDetail,
    eventsWithDirections,
    merge,
    routeFormatter,
} from "../../reusable-functions/data_timeline";

const Schedule = (props) => {
    const [events, setEvents] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [unsatisfied, setUnsatisfied] = React.useState("");
    const [timingsArray, setTimingsArray] = React.useState([]);
    const [isLoading, setLoading] = React.useState(true);

    React.useEffect(() => {
        console.log(
            "What is this",
            props.initRoutes,
            props.timings,
            props.data
        );
        directionsArray(props.initRoutes, props.timings, props.data);
    }, [props.data]);

    const directionsArray = async (allRoutes, timings, data) => {
        const result = await Promise.all(
            allRoutes.map(async (route, index, element) => {
                let obj = { distance: "", duration: "", steps: [] };
                let steps = [];
                let distance = "";
                let duration = "";
                let origin =
                    typeof route === "object"
                        ? route.lat + "," + route.long
                        : route;
                let destination = element[index + 1];
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
                    let data = (await resp.json())["routes"][0]["legs"][0];
                    let response = data["steps"];
                    distance = data["distance"]["text"];
                    duration = data["duration"]["text"];

                    for (let j = 0; j < response.length; j++) {
                        steps.push(await routeFormatter(await response[j]));
                    }
                } catch (err) {
                    console.log(err);
                }
                obj.steps = steps;
                obj.distance = distance;
                obj.duration = duration;
                return obj;
                // result.push(obj);
            })
        );
        let updatedTimings = merge(timings, result);
        let combinedData = eventsWithDirections(updatedTimings, data, result);
        setTimingsArray(updatedTimings);
        setEvents(combinedData);
        setLoading(false);
    };

    const onReselect = (selected) => {
        const updatedData = props.data.map((item) => {
            if (item === unsatisfied) {
                return selected;
            } else {
                return item;
            }
        });
        const updatedCoord = updatedData.map((item) => {
            return { coord: item.coord, name: item.title };
        });
        props.eventsUpdate(updatedData);
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

        let updatedData = indexFinder.reduce((acc, item, index) => {
            if (item.genre !== "directions") {
                acc.push({ ...item, time: newTimingsArray[index].start });
            }
            return acc;
        }, []);
        // let updated = indexFinder.map((item, index) => {
        //     return
        // })
        // console.log("Timings are", newTimingsArray);
        // console.log("Reflected data are", updatedData);
        setUnsatisfied({ ...unsatisfied, time: newStartTime });
        setTimingsArray(newTimingsArray);
        props.eventsUpdate(updatedData);

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
