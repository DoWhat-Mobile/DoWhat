import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Badge } from 'react-native-elements';

const FoodCuisine = ({ cuisine, handleCuisineSelect, preferences }) => {
    const topVoted = Object.keys(preferences).reduce((x, y) => {
        return preferences[x] > preferences[y]
            ? x
            : y
    })

    const renderCuisine = (cuisine, selected, index) => {
        const cuisineIsTopVoted = cuisine == topVoted.toUpperCase()
            && preferences[topVoted] != 0;

        const numVotes = preferences[cuisine.toLowerCase()]
        if (!selected) {
            return (
                <View>
                    <TouchableOpacity style={styles.genreButton}
                        onPress={() => handleCuisineSelect(index)}>
                        <Text style={styles.buttonText}>{cuisine}</Text>
                    </TouchableOpacity>
                    {cuisineIsTopVoted
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, left: 0 }}
                            value={numVotes}
                            badgeStyle={{ backgroundColor: 'black', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold' }}
                        />
                        : null
                    }

                    {cuisineIsTopVoted
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, right: 2 }}
                            value={'Top Voted'}
                            badgeStyle={{ backgroundColor: '#E86830', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold' }}
                        />
                        : null
                    }


                </View>
            );
        } else {
            return (
                <View>
                    <TouchableOpacity style={[styles.genreButton, {
                        backgroundColor: '#E86830',
                        borderColor: '#E13F19'
                    }]}
                        onPress={() => handleCuisineSelect(index)}>
                        <Text style={[styles.buttonText, {
                            color: '#FEFBFA'
                        }]}>{cuisine}</Text>
                    </TouchableOpacity>
                    {cuisineIsTopVoted
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, left: 0 }}
                            value={numVotes + 1}
                            badgeStyle={{ backgroundColor: 'white', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold', color: 'black' }}
                        />
                        : null

                    }

                    {cuisineIsTopVoted
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, right: 2 }}
                            value={'Top Voted'}
                            badgeStyle={{ backgroundColor: 'white', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold', color: 'black' }}
                        />
                        : null
                    }
                </View>
            );
        }
    }

    return (
        <View style={{ marginTop: 10 }}>
            <Text style={styles.genreSelectionText}>Cuisine</Text>
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
        padding: 12,
        borderRadius: 5,
        margin: 5,
        marginRight: 10,
        width: 90,
    },
    genreSelectionText: {
        fontSize: 12, color: '#A4A4A6', fontWeight: '100',
    },
    buttonText: {
        fontSize: 11, fontWeight: '100', textAlign: 'center'
    }

});