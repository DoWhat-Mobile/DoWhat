import React from "react";
import { View, Text } from "react-native";

const TransitRoute = ({ routes }) => {
    return (
        <View>
            <Text>HELLOOOOO</Text>
            <Text>HELLOOOOO</Text>
        </View>
    );
};

export default TransitRoute;
// import React, { useState, useEffect } from "react";
// import { Text, View, StyleSheet } from "react-native";
// import * as Location from "expo-location";

// const TransitRoute = () => {
//     const [location, setLocation] = useState(null);
//     const [errorMsg, setErrorMsg] = useState(null);

//     useEffect(() => {
//         (async () => {
//             let { status } = await Location.requestPermissionsAsync();
//             if (status !== "granted") {
//                 setErrorMsg("Permission to access location was denied");
//             }

//             let location = await Location.getCurrentPositionAsync({});
//             setLocation(location);
//         })();
//     }, []);

//     let text = "Waiting..";
//     if (errorMsg) {
//         text = errorMsg;
//     } else if (location) {
//         text = location;
//         let obj = {
//             lat: location.coords.latitude,
//             long: location.coords.longitude,
//         };
//         console.log(obj);
//     }

//     return (
//         <View style={styles.container}>
//             <Text>{text.timestamp}</Text>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
// });

// export default TransitRoute;
