import React from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { GOOGLE_MAPS_API_KEY } from "react-native-dotenv";

const Map = ({ onClose, coord }) => {
    console.log(coord);

    {
        /* <MapViewDirections
                    origin={coord[0].coord}
                    destination={coord[1].coord}
                    apikey={GOOGLE_MAPS_API_KEY}
                    strokeWidth={3}
                />
                <MapViewDirections
                    origin={coord[1].coord}
                    destination={coord[2].coord}
                    apikey={GOOGLE_MAPS_API_KEY}
                    strokeWidth={3}
                /> */
    }
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
                console.log(item.coord);
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
                onLayout={() => {
                    if (coord.length > 1) {
                        this.marker.showCallout();
                    }
                }}
            >
                {/* <MapViewDirections
                    origin={coord[0].coord}
                    destination={coord[1].coord}
                    apikey={GOOGLE_MAPS_API_KEY}
                    strokeWidth={3}
                />
                <MapViewDirections
                    origin={coord[1].coord}
                    destination={coord[2].coord}
                    apikey={GOOGLE_MAPS_API_KEY}
                    strokeWidth={3}
                /> */}

                {coord.map((marker, index) => {
                    if (index === 0) {
                        return (
                            <Marker
                                ref={(ref) => {
                                    this.marker = ref;
                                }}
                                key={marker.name}
                                coordinate={marker.coord}
                                title={marker.name}
                            >
                                <Callout>
                                    <View>
                                        <Text>Start</Text>
                                    </View>
                                </Callout>
                            </Marker>
                        );
                    } else {
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
