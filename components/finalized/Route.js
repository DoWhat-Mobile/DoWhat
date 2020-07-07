import React from "react";
import { View, Text, FlatList } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const Route = ({ item }) => {
    const block = (item) => {
        return (
            <View
                style={{
                    marginHorizontal: 10,
                    marginVertical: 10,
                    //marginBottom: 10,
                }}
            >
                {item.mode === "WALKING" ? (
                    <FontAwesome5 name="walking" size={24} color="black" />
                ) : item.instructions.includes("Bus") ? (
                    <FontAwesome5 name="bus-alt" size={24} color="black" />
                ) : (
                    <FontAwesome5 name="train" size={24} color="black" />
                )}
                <View style={{ width: 250 }}>
                    <Text>
                        {item.distance} {item.duration}
                    </Text>
                    <Text>{item.instructions}</Text>
                </View>
            </View>
        );
    };
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={item}
                horizontal={true}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => block(item)}
            />
        </View>
    );
};

export default Route;
