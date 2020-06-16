import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "react-native-elements";

const Item = ({ item, onReselect, onClose }) => {
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
                <View>
                    <Text>
                        {item.location}
                        {"\n"}
                    </Text>
                    <View>{item.description}</View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

export default Item;
