import React, { Component } from 'react'
import { View, Text } from 'react-native'

// might use tab navigator and define a static property 
class Genre extends Component {
    render() {
        return (
            < View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Text>Genre Selection Page</Text>
            </View >
        );
    }
}

export default Genre
