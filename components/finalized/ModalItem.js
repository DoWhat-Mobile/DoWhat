import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Card } from "react-native-elements";
import ReadMore from "react-native-read-more-text";

const Item = ({ item, onReselect, onClose }) => {
    const renderTruncatedFooter = (handlePress) => {
        return (
            <Text
                style={{ color: "#595959", marginTop: 5, marginLeft: 5 }}
                onPress={handlePress}
            >
                Read more
            </Text>
        );
    };

    const renderRevealedFooter = (handlePress) => {
        return (
            <Text
                style={{ color: "#595959", marginTop: 5, marginLeft: 5 }}
                onPress={handlePress}
            >
                Show less
            </Text>
        );
    };
    return (
        <TouchableOpacity
            onPress={() => {
                onReselect(item);
                onClose();
            }}
        >
            <Card
                title={item.title}
                containerStyle={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "stretch",
                    paddingHorizontal: 10,
                }}
                titleStyle={{
                    paddingHorizontal: 100,
                }}
            >
                {/* <View style={styles.container}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                        width: 240,
                        height: 120,
                        borderRadius: 25,
                        marginTop: 10,
                        marginLeft: 5,
                    }}
                />
                <Text>{item.title}</Text> */}
                <ReadMore
                    numberOfLines={4}
                    renderTruncatedFooter={renderTruncatedFooter}
                    renderRevealedFooter={renderRevealedFooter}
                >
                    <Text>{item.description}</Text>
                </ReadMore>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        marginVertical: 10,
    },
});
export default Item;
