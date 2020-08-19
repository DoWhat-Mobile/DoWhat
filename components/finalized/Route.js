import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

    let routes = "";
    let str =
        item.duration === "0 mins"
            ? "Sorry, there are no directions available!"
            : "Total time taken: " +
              item.duration +
              "\n" +
              "Total distance travelled: " +
              item.distance +
              "\n\n";

    const block = (item) => {
        //console.log(item);
        let temp = "";
        let directions = item.steps;
        for (let i = 0; i < item.steps.length; i++) {
            if (i === 0) {
                item.origin = directions[i].start;
            } else if (i === item.steps.length - 1) {
                item.destination = directions[i].start;
            }
            let block =
                "\n" +
                directions[i].distance +
                " " +
                directions[i].duration +
                "\n" +
                directions[i].instructions +
                "\n";
            temp += block;
        }
        item.duration;
        routes = temp;
    };
    block(item);
    return (
        // <ReadMore
        //     numberOfLines={1}
        //     renderTruncatedFooter={renderTruncatedFooter}
        //     renderRevealedFooter={renderRevealedFooter}
        // >
        <View style={{ flex: 1, elevation: 5 }}>
            <View style={styles.header}>
                <Text style={styles.title}>Directions</Text>
                <Text style={styles.description}>
                    Est. Time:{" "}
                    <Text style={styles.solid}>{item.duration} </Text>
                </Text>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    marginVertical: 5,
                    marginLeft: -5,
                }}
            >
                <MaterialCommunityIcons name="bus" size={20} color="black" />
                <Text style={styles.fromTo}> From : </Text>
                <Text
                    style={styles.solid}
                    numberOfLines={1}
                    ellipsizeMode={"tail"}
                >
                    {item.origin}
                </Text>
                <Text style={styles.fromTo}> To: </Text>
                <Text
                    style={styles.solid}
                    numberOfLines={1}
                    ellipsizeMode={"tail"}
                >
                    {item.destination}
                </Text>
            </View>
            <Text
                style={styles.description}
                numberOfLines={1}
                ellipsizeMode={"tail"}
            >
                {routes}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontSize: 20, fontWeight: "bold" },
    fromTo: {
        color: "#737373",
        fontSize: 12,
    },
    description: {
        color: "#737373",
        fontSize: 12,
    },
    solid: {
        width: 70,
        fontSize: 12,
        color: "black",
    },
});
export default Route;
