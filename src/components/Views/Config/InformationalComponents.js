import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Pressable, View, ScrollView } from "react-native";
import OpButton from "../../Shared/OpButton";
import Icon, { Icons } from "../../Icons";
import { useTranslation } from 'react-i18next';
import AText from "../../Shared/AText";
import { useNavigation, useTheme } from "@react-navigation/native";


export const VersionComponent = () => {

    const { colors } = useTheme(); //Variavel de cor do tema

    const navigation = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);

    var pressCounter = 0;

    const onPressHandler = () => {
        //setPressCounter(pressCounter++);
        pressCounter++;
        if(pressCounter >= 5) {
            pressCounter = 0;
            setModalVisible(!modalVisible);
            navigation.navigate("Tester");
        }
    }

    const { t, i18n } = useTranslation();

    return (
        <View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    pressCounter = 0;
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { backgroundColor: colors.background }]}>
                        <Pressable
                            style={styles.button}
                            onPress={() => {
                                pressCounter =0; 
                                setModalVisible(!modalVisible)
                            }}
                        >
                            <Icon type={Icons.Ionicons} name="close-circle" color={"#5469D3"} />
                        </Pressable>
                        <ScrollView style={{ marginBottom: 5 }}>
                            <Pressable onPress={onPressHandler}  >
                                <AText style={styles.modalText} defaultSize={20}>{t("version")}:</AText>
                            </Pressable>
                            <AText style={[styles.modalText, { color: colors.text }]} defaultSize={20}>1.0.0</AText>
                            <View style={[styles.line, { borderColor: colors.primary }]}></View>
                            <AText style={[styles.modalText, { marginTop: "5%" }]} defaultSize={20}>{t("update")}:</AText>
                            <AText style={[styles.modalText, { color: colors.text }]} defaultSize={20}>1.0.0:</AText>
                            <AText style={[styles.modalText, { color: colors.text }]} defaultSize={18}>{t("changes")}</AText>
                            <View style={[styles.line, { borderColor: colors.primary }]}></View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <OpButton theme='secundaryButton' textStyle='text2' title={t("version")} onPressFunction={() => setModalVisible(true)} />
        </View>
    );
};

export const AboutComponent = () => {

    const { colors } = useTheme(); //Variavel de cor do tema

    const [modalVisible, setModalVisible] = useState(false);

    const { t, i18n } = useTranslation();

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
                    <View style={[styles.modalView, { backgroundColor: colors.background }]}>
                        <Pressable
                            style={styles.button}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Icon type={Icons.Ionicons} name="close-circle" color={"#5469D3"} />
                        </Pressable>
                        <ScrollView style={{ marginBottom: 5 }}>
                            <AText style={styles.modalText} defaultSize={20}>{t("about")}:</AText>
                            <AText style={styles.modalText} defaultSize={18}>{t("dev")}</AText>
                            <AText style={[styles.modalText, { color: colors.text }]} defaultSize={16}>
                                {t("GTS")}
                            </AText>
                            <AText style={[styles.modalText, { color: colors.text }]} defaultSize={16}>
                                {t("GRP")}
                            </AText>
                            <AText style={styles.modalText} defaultSize={17}>{t("dev_note")}</AText>
                            <AText style={[styles.devText, { color: colors.text, marginLeft: 8, marginRight: 8 }]} defaultSize={16}>
                                {t("dev_note2")}
                            </AText>
                            <AText style={styles.modalText} defaultSize={18}>{t("special thanks")}</AText>
                            <AText style={[styles.thanksText, { color: colors.text }]} defaultSize={16}>
                                {t("names")}
                            </AText>
                            <AText style={styles.modalText} defaultSize={18}>{t("declaration")}</AText>
                            <AText style={[styles.modalText, { color: colors.text }]} defaultSize={16}>
                                {t("pictures")}
                            </AText>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <OpButton theme='secundaryButton' textStyle='text2' title={t("about")} onPressFunction={() => setModalVisible(true)} />
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
        height: '65%',
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
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        fontSize: 18,
        marginLeft: 30,
        marginTop: 10,
        color: "white",
    },
    modalText: {
        color: "#5469D3",
        fontWeight: "bold",
        marginBottom: 15,
        marginLeft: 10,
        fontSize: 20,
        textAlign: "left",
    },
    devText: {
        color: "#5469D3",
        fontWeight: "bold",
        marginBottom: 15,
        marginLeft: 10,
        fontSize: 20,
        textAlign: "justify",
    },
    thanksText: {
        color: "#5469D3",
        fontWeight: "bold",
        marginBottom: 15,
        marginLeft: 10,
        fontSize: 20,
        textAlign: "left",
    },
    line: {
        borderBottomWidth: 2,
        borderColor: '#1B2B39',
        margin: 20,
        marginLeft: 15,
        marginRight: 15
    }
});
