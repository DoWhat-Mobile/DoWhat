import React from "react";
import { View, Text } from "react-native";

const TransitRoute = ({ routes }) => {
    const [allRoutes, setRoutes] = React.useState([]);

    React.useEffect(() => {
        setRoutes(routes);
        //console.log(routes);
    }, []);
    return (
        <View>
            <Text>HELLOOOOO</Text>
        </View>
    );
};
export default TransitRoute;
