import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const Route = ({ item }) => {
    const block = (item) => {
        return (
            <View
                style={{
                    marginVertical: 10,
                    marginHorizontal: 10,
                }}
            >
                {item.mode === "WALKING" ? (
                    <FontAwesome5 name="walking" size={24} color="black" />
                ) : item.instructions.includes("Bus") ? (
                    <FontAwesome5 name="bus-alt" size={24} color="black" />
                ) : (
                    <FontAwesome5 name="train" size={24} color="black" />
                )}
                <View style={{ width: 200 }}>
                    <Text style={{ fontSize: 13 }}>
                        {item.distance} {item.duration} {"\n"}
                    </Text>
                    <View
                        style={{
                            borderBottomColor: "black",
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            width: 300,
                        }}
                    />
                    <Text style={{ fontSize: 14 }}>{item.instructions}</Text>
                </View>
            </View>
        );
    };
    return (
        <FlatList
            data={item}
            horizontal={true}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => block(item)}
        />
    );
};

export default Route;
