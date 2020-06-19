import React from "react";
import MapView from "react-native-maps";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const Map = ({ onClose, coord }) => {
    console.log(coord);
    return (
        <View style={styles.container}>
            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: 1.3521,
                    longitude: 103.851959,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                }}
            />
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#fff",
        // alignItems: "center",
        // justifyContent: "center",
    },
    // mapStyle: {
    //     width: Dimensions.get("window").width,
    //     height: Dimensions.get("window").height,
    // },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
});

export default Map;
