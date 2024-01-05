import React from 'react';
import { Modal, Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon, { Icons } from '../Icons';
import AText from './AText';
import { useTranslation } from 'react-i18next';

const ComingSoonComponent = ({ visible, onDismiss }) => {

    const { colors } = useTheme();
    const { t, i18n } = useTranslation();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onDismiss}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={onDismiss}
                    >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-close-outline"
                            color={"#33526E"}
                            size={60}
                        //style={styles.icon}
                        />
                    </TouchableOpacity>
                    <View style={{margin: 10}}>
                        <AText style={[styles.title, { color: colors.text }]} defaultSize={24}>{t("comingSoon.title")}</AText>
                        <AText style={[styles.message, { color: colors.text }]} defaultSize={19}>{t("comingSoon.message")}</AText>
                    </View>
                    <Image style={styles.figure} source={require('../../../assets/Robo_triste_centralizado.png')} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        height: '100%',
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.8)",
    },
    modalView: {
        margin: 20,
        backgroundColor: "#141f29",
        borderRadius: 20,
        paddingBottom: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    title: {
        fontSize: 24,
        color: "#7977FD",
        marginBottom: '8%',
        textAlign: "center",
        fontWeight: "bold",
    },
    message: {
        fontSize: 19,
        color: '#fff',
        marginBottom: 15,
        textAlign: "center"
    },
    button: {
        marginLeft: "83%",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    figure: {
        height: 200,
        width: 130,
    }
});

export default ComingSoonComponent;