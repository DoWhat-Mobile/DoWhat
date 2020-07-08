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
} from "react-native";
import { connect } from "react-redux";
import * as actions from "../../actions";
import Schedule from "./Schedule";
import Map from "./Map";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { YellowBox } from "react-native";
import moment from "moment";

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
                <View style={styles.header}>
                    <View
                        style={{
                            marginLeft: 10,
                            flexDirection: "row",
                            alignItems: "flex-start",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 22,
                                lineHeight: 23,
                                marginTop: 15,
                                marginLeft: 10,
                                fontWeight: "bold",
                            }}
                        >
                            Weather on {moment(props.date).date()}
                        </Text>
                        <Text style={{ fontSize: 11, lineHeight: 20 }}>th</Text>

                        {weatherIcon(weather)}
                    </View>
                </View>
                <View style={styles.image}>
                    <TouchableOpacity onPress={() => setVisible(true)}>
                        <Image
                            style={{
                                borderRadius: 10,
                                height: 120,
                                width: 360,
                            }}
                            source={require("../../assets/map.png")}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.body}>
                    <Text style={styles.title}>Events</Text>
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
                </View>
            </ScrollView>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        flex: 0,
        // justifyContent: "center",
        // alignItems: "center",
    },
    body: {
        //flex: 4,
    },
    image: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        //height: 40,
    },
    icon: {
        fontSize: 35,
        marginVertical: 10,
        marginLeft: 170,
    },
    title: {
        marginTop: 10,
        marginBottom: -25,
        marginLeft: 20,
        fontSize: 25,
        fontWeight: "bold",
    },
});

const mapStateToProps = (state) => {
    return {
        finalGenres: state.genre.genres,
        finalTiming: state.timeline.finalTiming,
        allEvents: state.add_events.events,
        userID: state.add_events.userID,
        date: state.date_select.date,
    };
};

export default connect(mapStateToProps, actions)(Finalized);
