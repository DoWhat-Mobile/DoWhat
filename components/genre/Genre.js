import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import FoodFilter from "./FoodFilter";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { findOverlappingIntervals } from "../../reusable-functions/OverlappingIntervals";
import firebase from "../../database/firebase";

// might use tab navigator and define a static property
const Genre = (props) => {
    const [visible, setVisible] = React.useState(false);
    const [selected, setSelected] = React.useState([]);
    const [preference, setPreference] = React.useState({});
    // const [isLoading, setIsLoading] = React.useState(true);
    const genreType = ["ADVENTURE", "ARTS", "LEISURE", "NATURE", "NIGHTLIFE"];
    const finalized = [];

    const [freeTime, setFreeTime] = React.useState([]);
    // const route = props.route.params.route;

    /**
     * Get data from firebase and initiate algo to find overlapping time intervals.
     */
    // React.useEffect(() => {
    //     const userId = firebase.auth().currentUser.uid; //Firebase UID of current user
    //     firebase
    //         .database()
    //         .ref("users/" + userId)
    //         .once("value")
    //         .then((snapshot) => {
    //             const userData = snapshot.val();
    //             const allAttendees = userData.all_attendees; // Undefined if no friends synced their Gcal
    //             const mainUserBusyPeriod = userData.busy_periods;
    //             const finalizedTimeRange = findOverlappingIntervals(
    //                 allAttendees,
    //                 mainUserBusyPeriod
    //             );
    //             // Returns finalized available range [20,24]
    //             return finalizedTimeRange;
    //         })
    //         .then((resultRange) => {
    //             // resultRange is undefined if no friends synced their Gcal
    //             setFreeTime(resultRange); // Set state
    //             setIsLoading(false);
    //         })
    //         .catch((err) => {
    //             // Error occurs when no friends synced their Gcal, then we will use the route input timings
    //             setFreeTime(props.finalTiming);
    //             setIsLoading(false);
    //         });
    // }, []);

    // if (isLoading) {
    //     return <Text>Wait for all friends to input their time</Text>;
    // }

    const onClose = () => {
        setVisible(false);
    };
    const onComplete = () => {
        selected.forEach((element) => {
            finalized.push(element);
        });
        props.onFinalize([finalized, props.finalTiming, preference]);
        props.syncWithFirebaseThenNavigate();
        // props.navigation.navigate("Loading", {
        //     // route: route,
        //     access: "host",
        // });
    };

    /**
     * Allows toggling background color and interaction between multiple buttons
     * @param {*} genre
     */
    const handlePress = (genre) => {
        selected.includes(genre)
            ? setSelected(selected.filter((s) => s !== genre))
            : setSelected([...selected, genre]);
    };

    /**
     * handles when the modal will be displayed and settles the dining option picked
     */
    const handleFoodPress = () => {
        if (selected.includes("food")) {
            setSelected(selected.filter((s) => s !== "food"));
            setPreference({});
        } else {
            setVisible(true);
        }
    };

    /**
     * Only allows for one dining option to be picked
     * @param {*} option
     */
    const selectFilter = (filters) => {
        setPreference(filters);
    };

    const buttons = () =>
        genreType.map((items) => (
            <TouchableOpacity
                key={items}
                onPress={() => handlePress(items)}
                style={[
                    styles.button,
                    selected.includes(items)
                        ? {
                              backgroundColor: "#F28333",
                          }
                        : { backgroundColor: "#ffe0b3" },
                ]}
            >
                <Text
                    style={{
                        fontSize: 14,
                        fontFamily: "serif",
                        fontWeight: "bold",
                        color: selected.includes(items) ? "#ffe0b3" : "#F28333",
                    }}
                >
                    {items}
                </Text>
            </TouchableOpacity>
        ));

    return (
        <View style={{ backgroundColor: "#fff5e6" }}>
            <Modal animated visible={visible} animationType="fade">
                <FoodFilter
                    onClose={onClose}
                    handlePress={handlePress}
                    selectFilter={selectFilter}
                />
            </Modal>

            <View style={styles.textContainer}>
                <Text
                    style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        fontFamily: "serif",
                        textAlign: "center",
                        marginTop: 20,
                    }}
                >
                    Choose your favourite genres
                </Text>
            </View>

            <View View style={styles.buttonContainer}>
                {buttons()}

                <TouchableOpacity
                    style={[
                        styles.button,
                        selected.includes("food")
                            ? {
                                  backgroundColor: "#F28333",
                              }
                            : { backgroundColor: "#ffe0b3" },
                    ]}
                    onPress={() => handleFoodPress()}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            fontFamily: "serif",
                            color: selected.includes("food")
                                ? "#ffe0b3"
                                : "#F28333",
                        }}
                    >
                        FOOD
                    </Text>
                </TouchableOpacity>
            </View>
            <View>
                {/* <Text style={{ marginLeft: 250 }}>
                    {preference === {} ? "" : Object.values(preference)}
                </Text> */}
            </View>

            <View>
                <TouchableOpacity
                    style={styles.continue}
                    onPress={() => onComplete()}
                >
                    <Text style={styles.continueButton}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        borderWidth: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        alignContent: "center",
        flexWrap: "wrap",
        borderBottomWidth: 0.5,
        borderColor: "#F9F0E6",
        marginLeft: 40,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 10,
        marginVertical: 10,
        borderColor: "white",
    },
    textContainer: {
        backgroundColor: "#fff5e6",
    },
    continue: {
        flexDirection: "column",
        alignSelf: "stretch",
        alignContent: "stretch",
        marginLeft: "5%",
        marginRight: "5%",
        marginTop: 5,
    },
    continueButton: {
        fontSize: 20,
        fontFamily: "serif",
        textAlign: "center",
        borderRadius: 5,
        backgroundColor: "#ffe0b3",
        color: "#F28333",
    },
});

const mapStateToProps = (state) => {
    return {
        finalTiming: state.timeline.finalTiming,
    };
};

export default connect(mapStateToProps, actions)(Genre);
