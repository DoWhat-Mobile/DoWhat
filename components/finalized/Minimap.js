import React from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";

const Minimap = ({ coord }) => {
    const [coords, setCoords] = React.useState([]);
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
        setCoords(coord);
        setRegion(newRegion);
        setLoading(false);
    }, [coord]);

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
            <View style={[StyleSheet.absoluteFillObject]}>
                <MapView
                    style={[StyleSheet.absoluteFillObject]}
                    region={region}
                >
                    {coords.map((marker, index) => {
                        return (
                            <Marker
                                key={marker.name}
                                coordinate={marker.coord}
                                title={marker.name}
                            />
                        );
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
