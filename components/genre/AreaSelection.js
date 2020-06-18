import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const AreaSelection = ({ handleAreaPress }) => {
    const [selected, setSelected] = React.useState([]);
    const areas = ["North", "East", "West", "Central"];

    const handlePress = (area) => {
        setSelected(area);
    };

    const buttons = () =>
        areas.map((items) => (
            <TouchableOpacity
                key={items}
                onPress={() => {
                    handlePress(items);
                    handleAreaPress(items);
                }}
                style={[
                    styles.button,
                    {
                        backgroundColor: selected.includes(items)
                            ? "silver"
                            : "white",
                    },
                ]}
            >
                <Text
                    style={{
                        fontSize: 16,
                    }}
                >
                    {items}
                </Text>
            </TouchableOpacity>
        ));

    return (
        <View style={{ marginTop: 20 }}>
            <Text style={styles.header}>Areas</Text>
            <View style={styles.buttonContainer}>{buttons()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 10,
        padding: 5,
        borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 5,
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginLeft: 20,
    },
    header: {
        marginLeft: 25,
        fontSize: 20,
        fontWeight: "bold",
    },
});

export default AreaSelection;
