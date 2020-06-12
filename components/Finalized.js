import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import Timeline from "react-native-timeline-flatlist";
import firebase from "../database/firebase";
import ReadMore from "react-native-read-more-text";

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
        return <Text>Loading..</Text>;
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
        timingsArray.push(startTime);
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
                    timingsArray.push(startTime);
                }
            }
            startTime++; // in case the start time is too early and there are no time slots to schedule
            if (food === 1 && startTime >= 18 && startTime < 20)
                testEvents.push("hawker");
            if (startTime >= timeline[1]) break;
        }

        // Sends invite to all attendees of the finalized event
        const sendGcalInvite = () => {};

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
                    <TouchableOpacity onPress={sendGcalInvite}>
                        <Text style={styles.proceed}>Proceed</Text>
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
