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
    let str =
        "Total time taken: " +
        item.duration +
        "\n" +
        "Total distance travelled: " +
        item.distance +
        "\n\n";
    const block = (item) => {
        //console.log(item);
        let str = "";
        let directions = item.steps;
        for (let i = 0; i < item.steps.length; i++) {
            console.log("Is this printed", directions[i]);
            let block =
                "\n" +
                directions[i].distance +
                " " +
                directions[i].duration +
                "\n" +
                directions[i].instructions +
                "\n";
            str += block;
        }
        console.log(str);
        return str;
    };

    return (
        <ReadMore
            numberOfLines={1}
            renderTruncatedFooter={renderTruncatedFooter}
            renderRevealedFooter={renderRevealedFooter}
        >
            <Text style={{ fontSize: 16 }}>{str}</Text>
            <Text style={{ marginLeft: 5 }}>{block(item)}</Text>
        </ReadMore>
    );
};

export default Route;
