import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import Timeline from "react-native-timeline-flatlist";
import firebase from "firebase";
import ReadMore from "react-native-read-more-text";

const Finalized = (props) => {
    const [events, setEvents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const testEvents = props.finalGenres;
    const testTime = [5, 11];

    React.useEffect(() => {
        firebase
            .database()
            .ref("events")
            .once("value")
            .then((snapshot) => {
                setEvents(snapshot.val());
                setIsLoading(false);
                console.log(props.finalTiming);
            });
    }, []);

    if (isLoading) {
        return <Text>Loading..</Text>;
    }

    const data = [];
    let startTime = props.finalTiming[0];

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

    for (i = 0; i < testEvents.length; i++) {
        const genre = testEvents[i];
        console.log(genre);
        const numEvents = events[genre].length;
        const randomNumber = Math.floor(Math.random() * numEvents);
        const event = events[genre][randomNumber];
        data[i] = {
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
        startTime += event.duration;
        if (startTime > props.finalTiming[1]) break;
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
