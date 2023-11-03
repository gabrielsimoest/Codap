import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Pressable, View, ScrollView } from "react-native";
import OpButton from "../Helpers/OpButton";
import Icon, { Icons } from "../components/Icons";
import '../Translations/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { useTheme } from "@react-navigation/native";
import AText from "../Helpers/AText";
import AsyncStorage from '@react-native-async-storage/async-storage';

const textSize = 20;

const TranslateComponet = () => {

    const {colors} = useTheme(); //Variavel de cor do tema

    const [modalVisible, setModalVisible] = useState(false);

    const { t, i18n } = useTranslation();

    const [currentLanguage, setLanguage] = useState('pt');

    React.useEffect(() => {
        AsyncStorage.getItem('@language_key')
            .then(value => {
                if (value !== null) {
                    setLanguage(value);
                }
            })
            .catch(error => {
                console.error('Error retrieving language:', error);
            });
    }, []);

    const changeLanguage = value => {
        i18n
            .changeLanguage(value)
            .then(() => {
                setLanguage(value);
                AsyncStorage.setItem('@language_key', value);
            })
            .catch(err => console.log(err));
    };

    return (
        <View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, {backgroundColor: colors.background}]}>
                        <Pressable
                            style={styles.button}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Icon type={Icons.Ionicons} name="close-circle" color={"#5469D3"}/>
                        </Pressable>
                        <AText style={styles.modalText} defaultSize={textSize}>{t("select the language:")}</AText>
                        <ScrollView style={{marginBottom: 5}}>
                            <OpButton theme={"settingsButton"} title="PORTUGUÊS" themeColorEnable={false} textColor={currentLanguage === 'pt' ? '#5469D3' : colors.text} onPressFunction={() => changeLanguage('pt')}/>
                            <OpButton theme={"settingsButton"} title="ENGLISH" themeColorEnable={false} textColor={currentLanguage === 'en' ? '#5469D3' : colors.text} onPressFunction={() => changeLanguage('en')}/>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <OpButton theme='secundaryButton' textStyle='text2' title={t("language")} onPressFunction={() => setModalVisible(true)} />
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: "#141f29",
        borderColor: "#637aff",
        borderWidth: 1,
        borderRadius: 20,
        height: '50%',
        width: "90%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 8
    },
    button: {
        margin: 10,
    },
    modalText: {
        color: "#5469D3",
        fontWeight: "bold",
        marginBottom: 15,
        marginLeft: 10,
        fontSize: 20,
    },
});

export default TranslateComponet;