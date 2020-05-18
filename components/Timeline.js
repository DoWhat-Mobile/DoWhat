import React from "react";
import { View, Text } from "react-native";
import Draggable from 'react-native-draggable'; // Library to allow draggable objects, for better UI

// might use tab navigator and define a static property
const Timeline = () => {
  return (
    <View>
      <Draggable x={75} y={100} renderSize={56} renderColor='black' renderText='A' isCircle shouldReverse onShortPressRelease={() => alert('touched!!')} />
      <Draggable x={200} y={300} renderColor='red' renderText='B' />
      <Draggable />
      <Draggable x={50} y={50}>
        <Text>Drag me</Text>
      </Draggable>
    </View>
  );
};

export default Timeline;
