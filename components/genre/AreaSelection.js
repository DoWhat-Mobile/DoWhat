import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { buttons } from '../../reusable-functions/buttons';
const AreaSelection = ({ handleAreaPress }) => {
	const [selected, setSelected] = React.useState([]);
	const areas = ['North', 'East', 'West', 'Central'];

	const handlePress = (area) => {
		let newSelected = [];

		if (selected.includes(area)) {
			newSelected = selected.filter((s) => s !== area);
		} else {
			newSelected = selected.concat(area);
		}

		setSelected(newSelected);
		handleAreaPress(newSelected);
	};

	return (
		<View style={{ marginTop: 20 }}>
			<Text style={styles.header}>Areas</Text>
			<View style={styles.buttonContainer}>{buttons(areas, selected, handlePress)}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	header: {
		fontSize: 20,
		fontWeight: 'bold',
		marginLeft: 5,
	},
});

export default AreaSelection;
