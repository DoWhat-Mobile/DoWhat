import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { connect } from "react-redux";
import * as actions from "../../actions";
import Schedule from "./Schedule";

const Finalized = (props) => {
    const [events, setEvents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    console.log("Finalized time from Gcal is: ", props.finalGenres[1]);

    React.useEffect(() => {
        setEvents(props.allEvents);
        setIsLoading(false);
    }, []);

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
        console.log(props.finalGenres);
        const testEvents = props.finalGenres[0];
        const filters = props.finalGenres[2];
        const timeline =
            props.route.params.route === "manual"
                ? props.finalTiming
                : props.finalGenres[1];

        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <Schedule
                        timeline={timeline}
                        testEvents={testEvents}
                        events={events}
                        navigation={props.navigation}
                        filters={filters}
                    />
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
    list: {
        flex: 1,
        marginTop: 20,
    },
});

const mapStateToProps = (state) => {
    return {
        finalGenres: state.genre.genres,
        finalTiming: state.timeline.finalTiming,
        allEvents: state.add_events.events,
    };
};

export default connect(mapStateToProps, actions)(Finalized);
