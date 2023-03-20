import React from 'react';
import { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, Text } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { irBlack, darcula, docco, androidstudio, atelierCaveLight, github } from 'react-syntax-highlighter/styles/hljs';
import OpButton from './Helpers/OpButton';
import Icon, { Icons } from './components/Icons'
import { useSelector } from 'react-redux';

export function TestSintax({ navigation }) {

    let currentTheme = useSelector(state => {
        return state.myDarkMode
      })

    const [modalVisible, setModalVisible] = useState(true);
    const [modalVisible2, setModalVisible2] = useState(false);
    
    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <Pressable
                        style={styles.web} onPress={() => [setModalVisible2(!modalVisible2), setModalVisible(!modalVisible)]}
                    >
                        <Text style={styles.text}>WEB</Text>
                    </Pressable>
                    <SyntaxHighlighter language="HTML" style={currentTheme ? irBlack : docco} fontSize={15}>
                        {`<!DOCTYPE html>
<html>
  <head>
    <title>Minha página</title>
  </head>
  <body>
    <h1>Minha página</h1>
    <p>Esta é a minha primeira página HTML!</p>
  </body>
</html>`}
                    </SyntaxHighlighter>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible2}
                onRequestClose={() => {
                    setModalVisible2(!modalVisible2);
                }}
            >
                <View style={styles.modalView}>
                    <Pressable
                        style={styles.idx2} onPress={() => [setModalVisible(!modalVisible), setModalVisible2(!modalVisible2)]}
                    >
                        <Text style={styles.text}>index</Text>
                    </Pressable>
                    <SyntaxHighlighter language="HTML" style={currentTheme ? darcula : github} fontSize={15}>
                        {`<!DOCTYPE html>
<html>
  <head>
    <title>Minha página</title>
  </head>
  <body>
    <h1>Minha página</h1>
    <p>Esta é a minha primeira página HTML!</p>
  </body>
</html>`}
                    </SyntaxHighlighter>
                </View>
            </Modal>
            <Pressable style={styles.idx} onPress={() => setModalVisible(!modalVisible)}><Text style={styles.text}>index</Text></Pressable>
        </View>
    )
}

//<OpButton theme='secundaryButton' textStyle='text2' title={"TESTE"} onPressFunction={() => setModalVisible(true)} />

const styles = StyleSheet.create({
    container: {
        height: "100%"
    },
    idx: {
        backgroundColor: "blue",
        width: "20%",
        height: "3%"
    },
    web: {
        marginLeft: "20%",
        backgroundColor: "red",
        width: "20%",
        height: "9%"
    },
    idx2: {
        backgroundColor: "blue",
        width: "20%",
        height: "9%"
    },
    text: {
        fontSize: 15,
        color: "#ffff",
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        margin: 10,
    },
    modalView: {
        // margin: 20,
        backgroundColor: "#141f29",
        //     borderColor: "#637aff",
        //  borderWidth: 2,
        height: '35%',
        width: "100%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 8
    },
})

