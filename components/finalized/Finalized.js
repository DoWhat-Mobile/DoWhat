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
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Finalized = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [visible, setVisible] = React.useState(false);
    const [coord, setCoord] = React.useState([]);
    const [data, setData] = React.useState([]);

    const route = props.route.params.route;
    const accessRights = props.route.params.access;
    const weather = props.route.params.weather;
    const currentEvents = props.route.params.currentEvents;
    const userGenres = props.route.params.userGenres;
    const timeline =
        route === "board"
            ? props.route.params.timeInterval
            : props.route.params.synced === "synced"
            ? props.route.params.time
            : props.finalGenres[1];
    const onClose = () => {
        setVisible(false);
    };

    const mapUpdate = (coord) => {
        setCoord(coord);
    };

    const weatherIcon = (weather) => {
        return weather === "Rain" || weather === "Thunderstorm" ? (
            <MaterialCommunityIcons
                name="weather-pouring"
                size={24}
                color="black"
                style={{ marginLeft: 350 }}
            />
        ) : weather === "Clouds" ? (
            <MaterialCommunityIcons
                name="weather-cloudy"
                size={24}
                color="black"
                style={{ marginLeft: 350 }}
            />
        ) : (
            <MaterialCommunityIcons
                name="weather-sunny"
                size={24}
                color="black"
                style={{ marginLeft: 350 }}
            />
        );
    };

    React.useEffect(() => {
        const data = data_timeline(
            timeline,
            userGenres,
            props.allEvents,
            currentEvents
        );

        setData(data);
        setCoord(data[2]);
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
        return (
            <View style={styles.container}>
                {weatherIcon(weather)}
                <Schedule
                    data={data}
                    navigation={props.navigation}
                    mapUpdate={mapUpdate}
                    genres={userGenres}
                    accessRights={accessRights}
                    userID={props.userID}
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
        userID: state.add_events.userID,
    };
};

export default connect(mapStateToProps, actions)(Finalized);
