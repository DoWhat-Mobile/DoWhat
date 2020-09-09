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
          backgroundColor: selected.includes(items) ? "#F28333" : "#ffe0b3",
        },
      ]}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: selected.includes(items) ? "#ffe0b3" : "#F28333",
        }}
      >
        {items}
      </Text>
    </TouchableOpacity>
  ));

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 10,
    marginVertical: 10,
    borderColor: "white",
  },
});
