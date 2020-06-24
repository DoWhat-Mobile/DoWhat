import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

const FoodCuisine = ({ cuisine, handleCuisineSelect }) => {
    const renderCuisine = (cuisine, selected, index) => {
        if (!selected) {
            return (
                <View>
                    <TouchableOpacity style={styles.genreButton}
                        onPress={() => handleCuisineSelect(index)}>
                        <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{cuisine}</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View>
                    <TouchableOpacity style={[styles.genreButton, { backgroundColor: '#e5e5e5' }]}
                        onPress={() => handleCuisineSelect(index)}>
                        <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{cuisine}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    return (
        <View style={{ marginTop: 10 }}>
            <Text style={styles.genreSelectionText}>Cuisine:</Text>
            <FlatList
                data={cuisine}
                horizontal={true}
                renderItem={({ item, index }) => renderCuisine(item[0], item[1], index)}
                keyExtractor={(item, index) => item + index}
            />
        </View>
    );
}

export default FoodCuisine;

const styles = StyleSheet.create({
    genreButton: {
        borderWidth: 0.5,
        padding: 3,
        borderRadius: 5,
        margin: 5,
    },
    genreSelectionText: {
        fontFamily: 'serif',
        marginLeft: 5,
        fontSize: 15,
        fontWeight: '800'
    },
});