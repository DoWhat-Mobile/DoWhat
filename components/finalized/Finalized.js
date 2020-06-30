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
import {
    data_timeline,
    genreEventObjectArray,
} from "../../reusable-functions/data_timeline";

const Finalized = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [visible, setVisible] = React.useState(false);
    const [coord, setCoord] = React.useState([]);
    const [data, setData] = React.useState([]);

    const route = props.route.params.route;

    const onClose = () => {
        setVisible(false);
    };

    const mapUpdate = (coord) => {
        setCoord(coord);
    };

    const userGenres =
        route === "board" ? props.route.params.genres : props.finalGenres[0];
    const filters =
        route === "board" ? props.route.params.filters : props.finalGenres[2];
    const timeline =
        route === "board"
            ? props.route.params.timeInterval
            : props.finalGenres[1];
    const currentEvents =
        route === "board"
            ? props.route.params.currentEvents
            : genreEventObjectArray(userGenres, props.allEvents, filters);

    React.useEffect(() => {
        if (props.allEvents != {}) {
            const data = data_timeline(
                timeline,
                userGenres,
                props.allEvents,
                currentEvents
            );
            setData(data);
            setCoord(data[2]);
            setIsLoading(false);
        }
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
        return (
            <View style={styles.container}>
                <Schedule
                    data={data}
                    navigation={props.navigation}
                    mapUpdate={mapUpdate}
                    genres={userGenres}
                />

                <Modal animated visible={visible} animationType="fade">
                    <Map onClose={onClose} coord={coord} />
                </Modal>
                <TouchableOpacity
                    onPress={() => {
                        setVisible(true);
                    }}
                >
                    <Text style={{ fontSize: 20 }}>Open Map View</Text>
                </TouchableOpacity>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
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
