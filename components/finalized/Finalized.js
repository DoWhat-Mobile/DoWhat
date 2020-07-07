import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
} from "react-native";
import { connect } from "react-redux";
import * as actions from "../../actions";
import Schedule from "./Schedule";
import Map from "./Map";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { YellowBox } from "react-native";

const Finalized = (props) => {
    YellowBox.ignoreWarnings(["VirtualizedLists should never be nested"]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [visible, setVisible] = React.useState(false);
    const [coord, setCoord] = React.useState([]);
    const [data, setData] = React.useState([]);

    //const route = props.route.params.route;
    const accessRights = props.route.params.access;
    const weather = props.route.params.weather;
    const userGenres = props.route.params.userGenres;
    const allData = props.route.params.data;

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
        const passed = props.route.params.routeGuide;
        setData(allData);
        setCoord(allData[2]);
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
            <ScrollView style={styles.container}>
                <View style={styles.header}>{weatherIcon(weather)}</View>
                <Text>HI</Text>
                {/* <TransitRoutes routes={routes} /> */}
                <View style={styles.body}>
                    <Schedule
                        data={allData}
                        navigation={props.navigation}
                        mapUpdate={mapUpdate}
                        genres={userGenres}
                        accessRights={accessRights}
                        userID={props.userID}
                        initRoutes={props.route.params.routeGuide}
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
            </ScrollView>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: "center",
    },
    header: {
        flex: 1,
    },
    body: {
        // flex: 4,
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
