import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

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
    let str = item.duration === 0 ? "Sorry, there are no directions available!" :
        "Total time taken: " +
        item.duration +
        "\n" +
        "Total distance travelled: " +
        item.distance +
        "\n\n";
    const block = (item) => {
        //console.log(item);
        let routes = "";
        let directions = item.steps;
        for (let i = 0; i < item.steps.length; i++) {
            let block =
                "\n" +
                directions[i].distance +
                " " +
                directions[i].duration +
                "\n" +
                directions[i].instructions +
                "\n";
            routes += block;
        }
        item.duration
        return routes;
    };

    return (
        <ReadMore
            numberOfLines={1}
            renderTruncatedFooter={renderTruncatedFooter}
            renderRevealedFooter={renderRevealedFooter}
        >
            <Text style={{ fontSize: 14 }}>{str}</Text>
            <Text style={{ marginLeft: 5 }}>{block(item)}</Text>
        </ReadMore>
    );
};

export default Route;
