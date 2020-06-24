import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

export const buttons = (list, selected, handlePress) =>
    list.map((items) => (
        <TouchableOpacity
            key={items}
            onPress={() => {
                handlePress(items);
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

const styles = StyleSheet.create({
    button: {
        borderRadius: 10,
        padding: 5,
        borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 5,
        marginVertical: 10,
    },
});
