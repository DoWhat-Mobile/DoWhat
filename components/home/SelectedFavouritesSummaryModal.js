import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

const SelectedFavouritesSummaryModal = ({ onClose }) => {

    return (
        <View>
            <Text>Modal</Text>
            <TouchableOpacity onPress={onClose}>
                <Text>
                    Close modal
                    </Text>
            </TouchableOpacity>
        </View>
    )
}

export default SelectedFavouritesSummaryModal;

const styles = StyleSheet.create({

})