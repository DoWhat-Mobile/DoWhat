import React, { useState } from 'react';
import { Button, View, StyleSheet, Text, TouchableOpacity, SectionList, Dimensions, Modal } from 'react-native';
import IndividualPlanModal from './IndividualPlanModal';

/**
 * The <SectionList> Component within the AllPlans component. This is the component
 * which shows all the plans that the user is part of.
 */
const ListOfPlans = ({ plans }) => {
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [modalVisibility, setModalVisibility] = useState(false);

    // Not functional yet
    const refreshPage = () => {
        setIsRefreshing(true);
        setIsRefreshing(false);
    }

    const renderCollaborationBoard = (board) => {
        return (
            <TouchableOpacity onPress={() => setModalVisibility(true)}>
                <View style={{ borderWidth: 1, borderRadius: 10, marginLeft: 10, marginRight: 10, padding: 10, marginTop: 10 }}>
                    <Text>
                        Outing on: {board.selected_date}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    const closeModal = () => {
        setModalVisibility(false);
    }

    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={false}
                visible={modalVisibility}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                }}>
                <IndividualPlanModal onClose={closeModal} />
            </Modal>

            <SectionList
                onRefresh={() => refreshPage()}
                progressViewOffset={100}
                refreshing={isRefreshing}
                sections={[
                    { title: "", data: plans },
                ]}
                renderItem={({ item }) => renderCollaborationBoard(item)}
                renderSectionHeader={({ section }) =>
                    <View style={styles.sectionHeader}>
                        <TouchableOpacity
                            onPress={() => handleTitlePress(section.title)}>
                            <Text style={styles.sectionHeaderText}>{section.title}</Text>
                        </TouchableOpacity>
                    </View>
                }
                keyExtractor={(item, index) => index}
            />
        </View >
    );
}

export default ListOfPlans;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        justifyContent: 'center',

    },
    headerText: {
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 20,
    },
    body: {
        flex: 7,
        justifyContent: 'center',
    },
    footer: {
        flex: 1,
    },
})