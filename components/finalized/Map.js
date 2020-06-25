import React from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { GOOGLE_MAPS_API_KEY } from "react-native-dotenv";

const Map = ({ onClose, coord }) => {
    /**
     * Renders all the path lines from the first event to the last
     * @param {*} coord is an array of objects with long lat of the events scheduled for the user
     */
    const directions = (coord) => {
        const start = coord[0].coord;
        const end = coord[coord.length - 1].coord;
        if (coord.length <= 1) return;
        if (coord.length === 2)
            return (
                <MapViewDirections
                    origin={start}
                    destination={end}
                    apikey={GOOGLE_MAPS_API_KEY}
                    strokeWidth={3}
                    mode={"WALKING"}
                />
            );
        if (coord.length > 2) {
            let waypoints = [...coord];
            waypoints.splice(0, 1);
            waypoints.splice(coord.length - 2, 1);
            let res = waypoints.map((item) => {
                return item.coord;
            });

            return (
                <MapViewDirections
                    origin={start}
                    destination={end}
                    apikey={GOOGLE_MAPS_API_KEY}
                    strokeWidth={3}
                    waypoints={res}
                    mode={"WALKING"}
                />
            );
        }
    };

    // const show = () => {
    //     this.mark.showCallout();
    // };

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
            // onLayout={() => {
            //     show();
            // }}
            >
                <Marker
                    // ref={(ref) => {
                    //     this.mark = ref;
                    // }}
                    key={coord[0].name}
                    coordinate={coord[0].coord}
                    title={coord[0].name}
                >
                    <Callout>
                        <View>
                            <Text>Start</Text>
                        </View>
                    </Callout>
                </Marker>
                {coord.map((marker, index) => {
                    if (index !== 0) {
                        return (
                            <Marker
                                key={marker.name}
                                coordinate={marker.coord}
                                title={marker.name}
                            />
                        );
                    }
                })}
                {directions(coord)}
            </MapView>
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
    },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
});

export default Map;
