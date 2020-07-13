import React from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";

const Minimap = ({ coord }) => {
    const [region, setRegion] = React.useState({});
    const [isLoading, setLoading] = React.useState(true);
    React.useEffect(() => {
        const newRegion = {
            latitude: coord.length == 0 ? 1.3521 : coord[0].coord.latitude,
            longitude:
                coord.length == 0 ? 103.851959 : coord[0].coord.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };
        setRegion(newRegion);
        setLoading(false);
    }, [coord]);

    const startRef = React.useRef(null);
    const onRegionChangeComplete = () => {
        if (startRef && startRef.current && startRef.current.showCallout) {
            startRef.current.showCallout();
        }
    };

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
            <View style={StyleSheet.absoluteFillObject}>
                <MapView
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={region}
                    onRegionChangeComplete={onRegionChangeComplete}
                >
                    <Marker
                        ref={startRef}
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
                </MapView>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
export default Minimap;
