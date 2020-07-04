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
import TransitRoutes from "./TransitRoutes";
import {
    data_timeline,
    genreEventObjectArray,
} from "../../reusable-functions/data_timeline";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TransitRoute from "./TransitRoutes";
import { GOOGLE_MAPS_API_KEY } from "react-native-dotenv";

const Finalized = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [visible, setVisible] = React.useState(false);
    const [coord, setCoord] = React.useState([]);
    const [data, setData] = React.useState([]);
    const [routes, setRoutes] = React.useState([]);

    const route = props.route.params.route;
    const accessRights = props.route.params.access;
    const weather = props.route.params.weather;
    //const currentEvents = props.route.params.currentEvents;
    const userLocation = props.route.params.userLocation;
    const userGenres = props.route.params.userGenres;
    const allData = props.route.params.data;

    let busRoutes = [];
    busRoutes.push(userLocation);

    const onClose = () => {
        setVisible(false);
    };

    const mapUpdate = (coord) => {
        setCoord(coord);
        // setRoutes(routes)
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
        // const locations = data[3];
        // let routesArray = [];
        // for (i = 0; i < locations.length - 1; i++) {}
        // fetch(
        //     "https://maps.googleapis.com/maps/api/directions/json?origin=OrchardTurn&destination=UpperChangiRoadNorth&key=" +
        //         GOOGLE_MAPS_API_KEY +
        //         "&mode=transit&region=sg"
        // );

        setData(allData);
        setCoord(allData[2]);
        setRoutes(busRoutes.concat(allData[3]));
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
                <View style={styles.header}>
                    {weatherIcon(weather)}
                    <TransitRoute />
                </View>
                <View style={styles.body}>
                    <Schedule
                        data={allData}
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
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    header: {
        flex: 1,
    },
    body: {
        flex: 4,
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
