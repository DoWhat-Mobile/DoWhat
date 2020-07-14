import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import ReadMore from "react-native-read-more-text";

const Route = ({ item }) => {
    const renderTruncatedFooter = (handlePress) => {
        return (
            <Text style={{ color: "#595959" }} onPress={handlePress}>
                Read more
            </Text>
        );
    };

    const renderRevealedFooter = (handlePress) => {
        return (
            <Text style={{ color: "#595959" }} onPress={handlePress}>
                Show less
            </Text>
        );
    };

    const block = (item) => {
        let str = "";
        for (let i = 0; i < item.length; i++) {
            let block =
                item[i].distance +
                " " +
                item[i].duration +
                "\n" +
                item[i].instructions +
                "\n\n";
            str += block;
        }
        return str;
    };

    return (
        <ReadMore
            numberOfLines={1}
            renderTruncatedFooter={renderTruncatedFooter}
            renderRevealedFooter={renderRevealedFooter}
        >
            <Text style={{ marginLeft: 5 }}>{block(item)}</Text>
        </ReadMore>
    );
};

export default Route;
