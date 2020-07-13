import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    ScrollView,
    Image,
    Dimensions,
} from "react-native";
import { connect } from "react-redux";
import * as actions from "../../actions";
import Schedule from "./Schedule";
import Map from "./Map";
import Minimap from "./Minimap";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { YellowBox } from "react-native";

const Finalized = (props) => {
    YellowBox.ignoreWarnings(["VirtualizedLists should never be nested"]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [visible, setVisible] = React.useState(false);
    const [coord, setCoord] = React.useState([]);
    const [routes, setRoutes] = React.useState([]);
    const [allData, setData] = React.useState([]);

    //const route = props.route.params.route;
    const data = props.route.params.data;
    const accessRights = props.route.params.access;
    const weather = props.route.params.weather;
    const userGenres = props.route.params.userGenres;

    const onClose = () => {
        setVisible(false);
    };

    const mapUpdate = (coord) => {
        setCoord(coord);
    };

    const routeUpdate = (selected, unsatisfied) => {
        let temp = routes;
        const result = temp.map((item) => {
            return item == unsatisfied.location ? selected.location : item;
        });
        setRoutes(result);
    };

    const weatherIcon = (weather) => {
        return weather === "Rain" || weather === "Thunderstorm" ? (
            <MaterialCommunityIcons
                name="weather-pouring"
                size={24}
                color="black"
                style={styles.icon}
            />
        ) : weather === "Clouds" ? (
            <MaterialCommunityIcons
                name="weather-cloudy"
                size={24}
                color="black"
                style={styles.icon}
            />
        ) : (
            <MaterialCommunityIcons
                name="weather-sunny"
                size={24}
                color="black"
                style={styles.icon}
            />
        );
    };

    React.useEffect(() => {
        //const userLocation = props.userLocation;
        const passed = props.route.params.routeGuide;
        const initRoutes = [
            {
                lat: props.userLocation.coords.latitude,
                long: props.userLocation.coords.longitude,
            },
        ].concat(data[3]);
        setData(data);
        setCoord(data[2]);
        setIsLoading(false);
        setRoutes(initRoutes);
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
            <ScrollView style={styles.container}>
                <View style={styles.header}></View>
                <View
                    style={{
                        height: Dimensions.get("window").height / 4,
                        width: Dimensions.get("window").width + 30,
                    }}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setVisible(true)}
                    >
                        <Minimap coord={coord} />
                    </TouchableOpacity>
                </View>
                <View style={styles.body}>
                    <View
                        style={{
                            marginLeft: 10,
                            flexDirection: "row",
                            alignItems: "flex-start",
                        }}
                    >
                        <Text style={styles.title}>Events</Text>

                        {weatherIcon(weather)}
                    </View>
                    <Schedule
                        data={allData}
                        navigation={props.navigation}
                        mapUpdate={mapUpdate}
                        genres={userGenres}
                        accessRights={accessRights}
                        userID={props.userID}
                        routeUpdate={routeUpdate}
                        initRoutes={routes}
                    />

                    <Modal animated visible={visible} animationType="fade">
                        <Map onClose={onClose} coord={coord} />
                    </Modal>
                </View>
            </ScrollView>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffebcc",
    },
    header: {
        flex: 0,
        //backgroundColor: "#cc5327",
        // justifyContent: "center",
        // alignItems: "center",
    },
    body: {
        flex: 1,
        marginTop: 10,
        //backgroundColor: "#ffcc80",
    },
    image: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    icon: {
        fontSize: 35,
        //marginTop: 10,
        marginLeft: 10,
    },
    title: {
        marginTop: 10,
        marginBottom: -35,
        marginLeft: 10,
        fontSize: 25,
        fontWeight: "bold",
        zIndex: 1,
    },
});

const mapStateToProps = (state) => {
    return {
        finalGenres: state.genre.genres,
        finalTiming: state.timeline.finalTiming,
        allEvents: state.add_events.events,
        userID: state.add_events.userID,
        date: state.date_select.date,
        userLocation: state.date_select.userLocation,
    };
};

export default connect(mapStateToProps, actions)(Finalized);
