import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Badge } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';
import SelectedFavouritesSummaryModal from './SelectedFavouritesSummaryModal';
import * as Progress from 'react-native-progress';
import { Entypo } from '@expo/vector-icons';
import RadioForm, {
	RadioButton,
	RadioButtonInput,
	RadioButtonLabel,
} from 'react-native-simple-radio-button';

/**
 * Bottom DYNAMIC tab of favourites list, shown when user is adding favourites for planning
 */
const FavouritesBottomBar = ({
	anyFavouritesClicked,
	favouriteSummaryModalVisible,
	setFavouriteSummaryModalVisible,
	numberOfFavouritesClicked,
	handleDoneSelectingFavourites,
	favourites,
	resetAddingFavourites,
}) => {
	const [selectingOption, setSelectingOption] = useState(false);
	const [addingToOngoingCollab, setAddingToOngoingCollab] = useState(false);
	const [selectedRadioButton, setSelectedRadioButton] = useState(0);

	const renderTextAndButton = () => {
		if (favouriteSummaryModalVisible) {
			// When modal visible, move Text and Button to SelectedFavouritesSummaryModal
			return (
				<SelectedFavouritesSummaryModal
					numberOfFavouritesClicked={numberOfFavouritesClicked}
					onClose={() => setFavouriteSummaryModalVisible(false)}
					allEvents={favourites}
				/>
			);
		}

		return (
			<View
				style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20 }}
			>
				<Text style={styles.numberSelected}>
					{numberOfFavouritesClicked} activities selected
				</Text>

				<Badge
					value={
						<MaterialCommunityIcons name='chevron-up' color={COLORS.orange} size={28} />
					}
					badgeStyle={{
						backgroundColor: 'white',
					}}
					onPress={() => setFavouriteSummaryModalVisible(true)}
					containerStyle={{ marginRight: '5%', marginTop: '3%' }}
				/>
			</View>
		);
	};

	if (!anyFavouritesClicked) return null;

	if (selectingOption) {
		var radio_props = [
			{ label: 'Start a new plan', value: 0 },
			{ label: 'Add to ongoing collaboration', value: 1 },
		];
		return (
			<View style={styles.container}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						paddingBottom: 10,
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							marginLeft: '5%',
						}}
					>
						<Badge
							value={
								<MaterialCommunityIcons
									name='chevron-left'
									color={COLORS.orange}
									size={28}
								/>
							}
							badgeStyle={{
								backgroundColor: 'white',
							}}
							onPress={() => setSelectingOption(false)}
							containerStyle={{ marginRight: '5%', marginTop: '3%' }}
						/>
						<Text style={[styles.numberSelected, { marginLeft: 0 }]}>
							Select an option to continue
						</Text>
					</View>

					<Badge
						value={<Entypo name='cross' size={22} color='black' />}
						badgeStyle={{
							backgroundColor: 'white',
						}}
						onPress={resetAddingFavourites}
						containerStyle={{ marginRight: '5%', marginTop: '3%' }}
					/>
				</View>

				<View style={{ marginLeft: '16%', marginBottom: '2%' }}>
					<RadioForm
						radio_props={radio_props}
						buttonSize={12}
						initial={selectedRadioButton}
						buttonColor={COLORS.orange}
						selectedButtonColor={COLORS.orange}
						onPress={(val) => setSelectedRadioButton(val)}
					/>
				</View>

				<TouchableOpacity
					style={[styles.summaryCartButton, { backgroundColor: COLORS.orange }]}
					onPress={() => handleDoneSelectingFavourites(selectedRadioButton)}
				>
					<Text
						style={{
							textAlign: 'center',
							color: 'white',
							justifyContent: 'center',
							fontWeight: 'bold',
							fontSize: 14,
						}}
					>
						Next{' '}
					</Text>

					<MaterialCommunityIcons name='greater-than' color={'white'} size={20} />
				</TouchableOpacity>
				<Progress.Bar
					progress={0.7}
					width={Dimensions.get('window').width}
					height={4}
					color={COLORS.orange}
					borderWidth={0}
					unfilledColor={'#C8C8C8'}
				/>
			</View>
		);
	}

	// When at least one event selected, can continue planning process
	if (numberOfFavouritesClicked > 0) {
		return (
			<View style={styles.container}>
				{renderTextAndButton()}

				<TouchableOpacity
					style={[styles.summaryCartButton, { backgroundColor: COLORS.orange }]}
					onPress={() => setSelectingOption(true)}
				>
					<Text
						style={{
							textAlign: 'center',
							color: 'white',
							justifyContent: 'center',
							fontWeight: 'bold',
							fontSize: 14,
						}}
					>
						Select a plan{' '}
					</Text>

					<MaterialCommunityIcons name='greater-than' color={'white'} size={20} />
				</TouchableOpacity>
				<Progress.Bar
					progress={0.4}
					width={Dimensions.get('window').width}
					height={4}
					color={COLORS.orange}
					borderWidth={0}
					unfilledColor={'#C8C8C8'}
				/>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{renderTextAndButton()}

			<View style={styles.summaryCartButton}>
				<Text
					style={{
						textAlign: 'center',
						color: 'white',
						justifyContent: 'center',
						fontWeight: 'bold',
						fontSize: 14,
					}}
				>
					Plan outing with favourites{' '}
				</Text>
				<MaterialCommunityIcons name='greater-than' color={'white'} size={20} />
			</View>
			<Progress.Bar
				progress={0.05}
				width={Dimensions.get('window').width}
				height={4}
				color={COLORS.orange}
				borderWidth={0}
				unfilledColor={'#C8C8C8'}
			/>
		</View>
	);
};

export default FavouritesBottomBar;

const styles = StyleSheet.create({
	container: {
		opacity: 100,
		borderRadius: 8,
		backgroundColor: 'white',
	},
	summaryCartButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		padding: 12,
		borderRadius: 8,
		marginLeft: '5%',
		marginRight: '5%',
		marginBottom: '3%',
		backgroundColor: '#D3D3D3',
	},
	numberSelected: {
		fontSize: 16,
		fontWeight: 'bold',
		marginLeft: '5%',
		marginTop: '2.5%',
	},
});
