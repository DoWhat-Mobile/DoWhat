import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

/**
 * Favourites list of the user, added from the Home feed.
 */
const Favourites = () => {
	return (
		<View style={styles.container}>
			<Text>Favourites</Text>
		</View>
	);
};

export default Favourites;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
});
