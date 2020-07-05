import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

const GenrePicker = ({ allGenres, handleGenreSelect }) => {
    const renderGenres = (genre, selected, index) => {
        if (!selected) {
            return (
                <View>
                    {/* 
                   <Badge
                        status="success"
                        containerStyle={{ position: 'absolute', bottom: 1, right: 4 }}
                        value={2}
                        badgeStyle={{ backgroundColor: '#121001' }}
                        textStyle={{ fontSize: 10 }}
                    />
                   */}
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
                    {/*
                    <Badge
                        status="success"
                        containerStyle={{ position: 'absolute', bottom: 1, right: 4 }}
                        value={2}
                        badgeStyle={{ backgroundColor: '#FEFBFA' }}
                        textStyle={{ color: '#121011', fontSize: 10 }}
                    />
                    */}
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