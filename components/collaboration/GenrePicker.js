import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

const GenrePicker = ({ allGenres, handleGenreSelect }) => {
    const renderGenres = (genre, selected, index) => {
        if (!selected) {
            return (
                <View>
                    <TouchableOpacity style={styles.genreButton}
                        onPress={() => handleGenreSelect(index)}>
                        <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{genre}</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View>
                    <TouchableOpacity style={[styles.genreButton, { backgroundColor: '#e5e5e5' }]}
                        onPress={() => handleGenreSelect(index)}>
                        <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{genre}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    return (
        <FlatList
            data={allGenres}
            horizontal={true}
            renderItem={({ item, index }) => renderGenres(item[0], item[1], index)}
            keyExtractor={(item, index) => item + index}
        />
    );
}

export default GenrePicker;

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
})