import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Text, Pressable, View } from "react-native";
import OpButton from "../Helpers/OpButton";
import Icon, { Icons } from "../components/Icons";
import { useTranslation } from 'react-i18next';
import { AdjustSize, Size} from "./AdjustSize";

const FontComponent = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const { t, i18n } = useTranslation();

    console.log(Size);

   // const [textSize, setSize] = useState(0);

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
                    <View style={styles.modalView}>
                        <Pressable
                            style={styles.button}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Icon type={Icons.Ionicons} name="close-circle" color={"#5469D3"}/>
                        </Pressable>
                        <Text style={styles.modalText}>Selecione o tamanho da fonte:</Text>
                        <View style={{marginTop: 5}}>
                            <OpButton theme={"settingsButton"} title="Pequena" onPressFunction={()=> AdjustSize({setSize: 1})}/>
                            <OpButton theme={"settingsButton"} title="Média" onPressFunction={()=> AdjustSize({setSize: 2})}/>
                            <OpButton theme={"settingsButton"} title="Grande" onPressFunction={()=> AdjustSize({setSize: 3})}/>                            
                        </View>
                    </View>
                </View>
            </Modal>
            <OpButton theme='secundaryButton' textStyle='text2' title={t("font")} onPressFunction={() => setModalVisible(true)} />
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: "#141f29",
        borderColor: "#637aff",
        borderWidth: 1,
        borderRadius: 20,
        height: '45%',
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
        fontSize: 20 + Size,
    },
});

export default FontComponent;