import React from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";

const FoodLocation = ({ location, handleLocationSelect }) => {
    const renderLocation = (location, selected, index) => {
        if (!selected) {
            return (
                <View>
                    <TouchableOpacity style={styles.genreButton}
                        onPress={() => handleLocationSelect(index)}>
                        <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{location}</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View>
                    <TouchableOpacity style={[styles.genreButton, {
                        backgroundColor: '#E86830',
                        borderColor: '#E13F19'
                    }]}
                        onPress={() => handleLocationSelect(index)}>
                        <Text style={{
                            fontFamily: 'serif', fontSize: 11,
                            color: '#FEFBFA', fontWeight: '100'
                        }}>
                            {location}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    return (
        <View style={{ marginTop: 10 }}>
            <Text style={styles.genreSelectionText}>Location</Text>
            <FlatList
                data={location}
                horizontal={true}
                renderItem={({ item, index }) => renderLocation(item[0], item[1], index)}
                keyExtractor={(item, index) => item + index}
            />
        </View>
    );
}

export default FoodLocation;

const styles = StyleSheet.create({
    genreButton: {
        borderWidth: 0.5,
        padding: 10,
        borderRadius: 5,
        margin: 5,
    },
    genreSelectionText: {
        fontFamily: 'serif',
        fontSize: 15,
        fontWeight: '800'
    },
});