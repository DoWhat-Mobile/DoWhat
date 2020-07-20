import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Badge } from 'react-native-elements';

const GenrePicker = ({ allGenres, handleGenreSelect, topGenres, preferences }) => {
    const renderGenres = (genre, selected, index) => {
        if (topGenres.length == 0) return; // Waiting for state to be updated
        const numVotes = preferences[genre.toLowerCase()]
        const top1 = topGenres[0][0].toUpperCase();
        // const top2 = topGenres[1][0].toUpperCase();
        // const top3 = topGenres[2][0].toUpperCase();
        const isTopGenre = genre == top1 // || genre == top2 || genre == top3;
        if (!selected) {
            return (
                <View>
                    <TouchableOpacity style={styles.genreButton}
                        onPress={() => handleGenreSelect(index)}>
                        <Text style={styles.buttonText}>{genre}</Text>
                    </TouchableOpacity>
                    {isTopGenre
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, right: 2 }}
                            value={'Top Voted'}
                            badgeStyle={{ backgroundColor: '#E86830', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold' }}
                        />
                        : null}

                    {isTopGenre
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, left: 0 }}
                            value={numVotes}
                            badgeStyle={{ backgroundColor: 'black', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold' }}
                        />
                        : null}

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
                        <Text style={[styles.buttonText, {
                            color: '#FEFBFA'
                        }]}>{genre}</Text>
                    </TouchableOpacity>
                    {isTopGenre
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, right: 2 }}
                            value={'Top Voted'}
                            badgeStyle={{ backgroundColor: 'white' }}
                            textStyle={{ fontSize: 9, color: 'black', fontWeight: 'bold' }}
                        />
                        : null}
                    {isTopGenre
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, left: 0 }}
                            value={numVotes + 1}
                            badgeStyle={{ backgroundColor: 'white', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold', color: 'black' }}
                        />
                        : null}
                </View>
            );
        }
    }

    return (
        <View>
            <FlatList
                data={allGenres}
                horizontal={true}
                renderItem={({ item, index }) => renderGenres(item[0], item[1], index)}
                keyExtractor={(item, index) => item + index}
            />

            {allGenres[5][1]  // Boolean indicating food is selected or not
                ? null
                : <Text style={{
                    position: 'absolute', marginTop: '12%',
                    fontSize: 12, fontWeight: '400', color: '#E86830',
                    fontFamily: 'serif', alignSelf: 'flex-end'
                }}>
                    Select food to enable filter selection
                    </Text>
            }
        </View>
    );
}

export default GenrePicker;

const styles = StyleSheet.create({
    genreButton: {
        borderWidth: 0.5,
        paddingTop: 12,
        padding: 10,
        borderRadius: 5,
        margin: 5,
        marginRight: 10,
        width: 90,

    },
    genreSelectionText: {
        fontFamily: 'serif',
        marginLeft: 5,
        fontSize: 15,
        fontWeight: '800',
        textAlign: 'center'
    },
    buttonText: {
        fontFamily: 'serif', fontSize: 11, fontWeight: '100', textAlign: 'center'
    }
})