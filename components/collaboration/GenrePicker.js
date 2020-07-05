import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Badge } from 'react-native-elements';

const GenrePicker = ({ allGenres, handleGenreSelect, topGenres }) => {
    const renderGenres = (genre, selected, index) => {
        if (topGenres.length == 0) return; // Waiting for state to be updated

        const top1 = topGenres[0][0].toUpperCase();
        const top2 = topGenres[1][0].toUpperCase();
        const top3 = topGenres[2][0].toUpperCase();
        const isTopGenre = genre == top1 || genre == top2 || genre == top3;
        if (!selected) {
            return (
                <View>
                    {isTopGenre
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: -2, left: -2 }}
                            value={'❤️'}
                            badgeStyle={{ backgroundColor: 'white' }}
                            textStyle={{ fontSize: 10 }}
                        />
                        : null}

                    <TouchableOpacity style={styles.genreButton}
                        onPress={() => handleGenreSelect(index)}>
                        <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{genre}</Text>
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
                        onPress={() => handleGenreSelect(index)}>
                        <Text style={{
                            fontFamily: 'serif', fontSize: 11,
                            color: '#FEFBFA', fontWeight: '100'
                        }}>{genre}</Text>
                    </TouchableOpacity>
                    {isTopGenre
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: -2, left: -2 }}
                            value={'❤️'}
                            badgeStyle={{ backgroundColor: 'white' }}
                            textStyle={{ fontSize: 10 }}
                        />
                        : null}
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
        padding: 10,
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