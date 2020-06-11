import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import Timeline from "react-native-timeline-flatlist";
import firebase from "../database/firebase";
import ReadMore from "react-native-read-more-text";

const Finalized = (props) => {
    const [events, setEvents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

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
        const timeFromLink = props.finalGenres[1];

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
        let startTime = timeFromLink[0]//props.finalTiming[0];
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
                                    {event.location} {"\n\n"} {event.description}
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
            if (startTime > timeFromLink[1]) break; //props.finalTiming[1]
        }

        return (
            <View style={styles.container}>
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
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 65,
        backgroundColor: "white",
    },
    list: {
        flex: 1,
        marginTop: 20,
    },
});

const mapStateToProps = (state) => {
    return {
        finalGenres: state.genre.genres,
        finalTiming: state.timeline.finalTiming,
    };
};

export default connect(mapStateToProps, actions)(Finalized);
