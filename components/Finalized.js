<<<<<<< HEAD
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import Timeline from "react-native-timeline-flatlist";
import firebase from "../database/firebase";
import ReadMore from "react-native-read-more-text";
import { handleProcess, formatEventsData } from "../reusable-functions/GoogleCalendarInvite";

const Finalized = (props) => {
    const [events, setEvents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    console.log("Finalized time from Gcal is: ", props.finalGenres[1]);

    React.useEffect(() => {
        firebase
            .database()
            .ref("events")
            .once("value")
            .then((snapshot) => {
                setEvents(snapshot.val());
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                <ActivityIndicator style={{ alignSelf: 'center' }} size='large' />
            </View>);
    } else {
        const testEvents = props.finalGenres[0];
        // const timeFromLink = props.finalGenres[1];

        const timeline =
            props.route.params.route === "manual"
                ? props.finalTiming
                : props.finalGenres[1];

        const renderTruncatedFooter = (handlePress) => {
            return (
                <Text
                    style={{ color: "#595959", marginTop: 5 }}
                    onPress={handlePress}
                >
                    Read more
                </Text>
            );
        };

        const renderRevealedFooter = (handlePress) => {
            return (
                <Text
                    style={{ color: "#595959", marginTop: 5 }}
                    onPress={handlePress}
                >
                    Show less
                </Text>
            );
        };

        /**
          * Formats data prop for timeline library
          */
        const data = [];
        const timingsArray = [];
        let startTime = timeline[0];

        // checks if user selected food so dinner will be included if user has time 6pm onwards
        let food =
            (testEvents.includes("hawker") ||
                testEvents.includes("restaurants") ||
                testEvents.includes("cafes")) &&
                startTime <= 13
                ? 1
                : 0;

        while (testEvents.length !== 0) {
            for (i = 0; i < testEvents.length; i++) {
                const genre = testEvents[i];
                const eventObject = events[genre]["list"];
                const numEvents = eventObject.length;
                const randomNumber = Math.floor(Math.random() * numEvents);
                const event = eventObject[randomNumber];
                if (events[genre].slots.includes(startTime)) {
                    let intervalObject = { start: 0, end: 0 };
                    intervalObject.start = startTime;
                    let activity = {
                        time: startTime + ":00",
                        title: `${event.name}`,

                        description: (
                            <ReadMore
                                numberOfLines={4}
                                renderTruncatedFooter={renderTruncatedFooter}
                                renderRevealedFooter={renderRevealedFooter}
                            >
                                <Text>
                                    {event.location} {"\n\n"}{" "}
                                    {event.description}
                                </Text>
                            </ReadMore>
                        ),
                    };
                    data.push(activity);
                    testEvents.splice(i, 1);
                    console.log(testEvents);
                    startTime += events[genre]["duration"];
                    intervalObject.end =
                        startTime > timeline[1] ? timeline[1] : startTime;
                    timingsArray.push(intervalObject);
                }
            }
            startTime++; // in case the start time is too early and there are no time slots to schedule
            if (food === 1 && startTime >= 18 && startTime < 20)
                testEvents.push("hawker");
            if (startTime >= timeline[1]) break;
        }

        /**
         * Sends invite to all attendees of the finalized event, also reset all_attendee
         * in the case of repeated use of app. (if never reset data, might use it for wrong
         * date)
         */
        const sendGcalInviteAndResetAttendeeData = () => {
            console.log("Timings Array: ", timingsArray);
            const formattedData = formatEventsData(data); // Formatted data contains event title
            // handleProcess function and all other logic is in GoogleCalendarInvite.js
            handleProcess(formattedData, timingsArray);
        }

        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <Timeline
                        data={data}
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
                        <Text style={styles.proceed}>
                            Proceed
                            </Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: "white",
    },
    footer: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "white",
    },
    list: {
        flex: 1,
        marginTop: 20,
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
        finalGenres: state.genre.genres,
        finalTiming: state.timeline.finalTiming,
    };
};

export default connect(mapStateToProps, actions)(Finalized);
=======
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import Timeline from "react-native-timeline-flatlist";
import firebase from "../database/firebase";
import ReadMore from "react-native-read-more-text";
import { handleProcess, formatEventsData } from "../reusable-functions/GoogleCalendarInvite";

const Finalized = (props) => {
    const [events, setEvents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    console.log("Finalized time from Gcal is: ", props.finalGenres[1]);

    React.useEffect(() => {
        firebase
            .database()
            .ref("events")
            .once("value")
            .then((snapshot) => {
                setEvents(snapshot.val());
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                <ActivityIndicator style={{ alignSelf: 'center' }} size='large' />
            </View>);
    } else {
        const testEvents = props.finalGenres[0];
        // const timeFromLink = props.finalGenres[1];

        const timeline =
            props.route.params.route === "manual"
                ? props.finalTiming
                : props.finalGenres[1];

        const renderTruncatedFooter = (handlePress) => {
            return (
                <Text
                    style={{ color: "#595959", marginTop: 5 }}
                    onPress={handlePress}
                >
                    Read more
                </Text>
            );
        };

        const renderRevealedFooter = (handlePress) => {
            return (
                <Text
                    style={{ color: "#595959", marginTop: 5 }}
                    onPress={handlePress}
                >
                    Show less
                </Text>
            );
        };

        const data = [];
        let startTime = timeline[0];
        let food =
            (testEvents.includes("hawker") ||
                testEvents.includes("restaurants") ||
                testEvents.includes("cafes")) &&
                startTime <= 13
                ? 1
                : 0;

        while (testEvents.length !== 0) {
            for (i = 0; i < testEvents.length; i++) {
                const genre = testEvents[i];
                const eventObject = events[genre]["list"];
                const numEvents = eventObject.length;
                const randomNumber = Math.floor(Math.random() * numEvents);
                const event = eventObject[randomNumber];
                if (events[genre].slots.includes(startTime)) {
                    let activity = {
                        time: startTime + ":00",
                        title: `${event.name}`,

                        description: (
                            <ReadMore
                                numberOfLines={4}
                                renderTruncatedFooter={renderTruncatedFooter}
                                renderRevealedFooter={renderRevealedFooter}
                            >
                                <Text>
                                    {event.location} {"\n\n"}{" "}
                                    {event.description}
                                </Text>
                            </ReadMore>
                        ),
                    };
                    data.push(activity);
                    testEvents.splice(i, 1);
                    console.log(testEvents);
                    startTime += events[genre]["duration"];
                }
            }
            startTime++; // in case the start time is too early and there are no time slots to schedule
            if (food === 1 && startTime >= 18 && startTime < 20)
                testEvents.push("hawker");
            if (startTime > timeline[1]) break; //props.finalTiming[1]
        }

        /**
         * Sends invite to all attendees of the finalized event, also reset all_attendee
         * in the case of repeated use of app. (if never reset data, might use it for wrong
         * date)
         */
        const sendGcalInviteAndResetAttendeeData = () => {
            const formattedData = formatEventsData(data);
            handleProcess(formattedData); // Function stored in GoogleCalendarInvite.js
        }

        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <Timeline
                        data={data}
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
                        <Text style={styles.proceed}>
                            Proceed
                            </Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: "white",
    },
    footer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    list: {
        flex: 1,
        marginTop: 20,
    },
    proceed: {
        borderWidth: 0.5,
        marginBottom: '5%',
        paddingTop: '1%',
        paddingBottom: '1%',
        paddingLeft: '20%',
        paddingRight: '20%',
        borderRadius: 5,
    }
});

const mapStateToProps = (state) => {
    return {
        finalGenres: state.genre.genres,
        finalTiming: state.timeline.finalTiming,
    };
};

export default connect(mapStateToProps, actions)(Finalized);
>>>>>>> c6f344264467b10cd5bd20050e870090101e796f
