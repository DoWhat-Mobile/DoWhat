import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from "react-native";
import { connect } from "react-redux";
import * as actions from "../../actions";
import Schedule from "./Schedule";
import Map from "./Map";
import { data_timeline } from "../../reusable-functions/data_timeline";

const Finalized = (props) => {
    const [events, setEvents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [visible, setVisible] = React.useState(false);
    const [coord, setCoord] = React.useState([]);

    // console.log("Finalized time from Gcal is: ", props.finalGenres[1]);

    const onClose = () => {
        setVisible(false);
    };

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
        const data = data_timeline(timeline, testEvents, events, filters);
        // setCoord(data[2]);
        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <Schedule
                        data={data}
                        navigation={props.navigation}
                        allEvents={events}
                    />
                </View>
                <Modal animated visible={visible} animationType="fade">
                    <Map onClose={onClose} coord={data[2]} />
                </Modal>
                <TouchableOpacity onPress={() => setVisible(true)}>
                    <Text style={{ fontSize: 20 }}>Open Map View</Text>
                </TouchableOpacity>
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
