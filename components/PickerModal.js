import React from "react";
import { View, Text, Picker, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const PickerModal = (props) => {
  const dining = ["restaurants", "cafes", "hawker"];
  const [pickerValue, setValue] = React.useState("Restaurants");
  const { onClose, handlePress, selectDining } = props;

  return (
    <View style={styles.modal}>
      <View style={styles.pickerContainer}>
        <View style={styles.header}>
          <AntDesign
            name="close"
            size={24}
            onPress={() => onClose()}
            style={{ marginLeft: 10 }}
          />

          <Text style={{ fontSize: 18 }}>Food</Text>

          <AntDesign
            name="check"
            size={24}
            style={{ marginRight: 10 }}
            onPress={() => {
              handlePress("Food");
              selectDining(pickerValue);
              onClose();
            }}
          />
        </View>
        <Picker
          selectedValue={pickerValue}
          onValueChange={(value) => setValue(value)}
        >
          {dining.map((type) => (
            <Picker.Item key={type} value={type} label={type} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerContainer: {
    height: 200,
    width: "100%",
    backgroundColor: "white",
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
  },
});
export default PickerModal;
