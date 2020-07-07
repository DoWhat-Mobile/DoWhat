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
    const genreType = ["adventure", "arts", "leisure", "nature", "nightlife"];
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
                style={styles.button}
            >
                <Text
                    style={{
                        fontSize: 18,
                        color: selected.includes(items) ? "green" : "black",
                    }}
                >
                    {items}
                </Text>
            </TouchableOpacity>
        ));

    return (
        <View>
            <Modal animated visible={visible} animationType="fade">
                <FoodFilter
                    onClose={onClose}
                    handlePress={handlePress}
                    selectFilter={selectFilter}
                />
            </Modal>

            <View style={styles.textContainer}>
                <Text style={{ fontFamily: "serif", fontSize: 20 }}>
                    Choose your favourite genres!
                </Text>
            </View>

            <View View style={styles.buttonContainer}>
                {buttons()}

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleFoodPress()}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            color: selected.includes("food")
                                ? "green"
                                : "black",
                        }}
                    >
                        Food
                    </Text>
                </TouchableOpacity>
            </View>
            <View>
                <Text style={{ marginLeft: 250 }}>
                    {preference === {} ? "" : Object.values(preference)}
                </Text>
            </View>
            <View
            // style={{
            //     f
            //     justifyContent: "flex-end",
            //     marginBottom: 36,
            // }}
            >
                <TouchableOpacity
                    style={styles.continue}
                    onPress={() => onComplete()}
                >
                    <Text style={styles.continueButton}>Continue</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            marginLeft: 287,
                            marginBottom: 200,
                            borderWidth: 0,
                        },
                    ]}
                >
                    <AntDesign
                        name="arrowright"
                        size={40}
                        onPress={() => {
                            onComplete();
                        }}
                    />
                </TouchableOpacity> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        alignContent: "center",
        flexWrap: "wrap",
    },
    button: {
        borderRadius: 20,
        padding: 20,
        borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 10,
        marginVertical: 10,
    },
    textContainer: {
        alignItems: "center",
        marginVertical: 60,
    },
    continue: {
        flexDirection: "column",
        alignSelf: "stretch",
        alignContent: "stretch",
        marginLeft: "5%",
        marginRight: "5%",
        //marginTop: 400,
    },
    continueButton: {
        fontSize: 20,
        borderWidth: 0.2,
        textAlign: "center",
        borderRadius: 5,
        backgroundColor: "#cc5327",
        color: "#fcf5f2",
    },
});

const mapStateToProps = (state) => {
    return {
        finalTiming: state.timeline.finalTiming,
    };
};

export default connect(mapStateToProps, actions)(Genre);
