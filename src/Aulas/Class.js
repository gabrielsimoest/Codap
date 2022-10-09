import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, SafeAreaView, TouchableWithoutFeedback} from 'react-native';
import { Surface, Title } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Fontisto';
import Icons from 'react-native-vector-icons/Ionicons';
import IconM from 'react-native-vector-icons/MaterialIcons';

import Css from './Css';
import Html from './Html'
import Javascript from './Javascript';


export function AppHeader(props,{ style }) {
    return (
        <Surface style={[styles.header, style, { backgroundColor: '#141f29', }]}>
            <View style={styles.view}>
                <IconM name="keyboard-arrow-down" size={30} color="white" />
            </View>
            <View style={styles.titleView}>
                <Title style={{ color: 'white', fontFamily: 'Roboto' }}>{props.tela}</Title>
            </View>
            <View style={[styles.view, styles.rightView]}>
                <Icons name={props.icone} size={25} color="#637aff" />
            </View>
        </Surface>
    );
};

export function ScreenJourney(props) {
    if (props.tela == "Css")
        return (<Css />)
    if (props.tela == "Html")
        return (<Html />)
    if (props.tela == 'Javascript')
        return (<Javascript />)
}

export default function Class({ navigation }) {
    const [visibleModal, setVisibleModal] = useState(false)
    const [journey, setJourney] = useState("Css")
    const [icon, setIcon] = useState("css3")

    const onPressCss = () => {
        setJourney("Css")
        setVisibleModal(false)
        setIcon("logo-css3")
    }
    const onPressJavascript = () => {
        setJourney("Javascript")
        setVisibleModal(false)
        setIcon("logo-javascript")
    }
    const onPressHtml = () => {
        setJourney("Html")
        setVisibleModal(false)
        setIcon("logo-html5")
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setVisibleModal(true)} ><AppHeader tela={journey} icone={icon} /></TouchableOpacity>

            <Modal
                visible={visibleModal}
                transparent={true}
                onRequestClose={() => setVisibleModal(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => setVisibleModal(false)}
                    style={{ flex: 1 }}
                >
                    <SafeAreaView
                        style={{ height: 1000 }}
                    >
                        <View style={styles.contant}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={onPressHtml}
                            >
                                <Icon name="html5" size={30} color="#637aff">
                                    <Text style={styles.actionText}>    HTML</Text>
                                </Icon>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={onPressCss}
                            >
                                <Icon name="css3" size={30} color="#637aff">
                                    <Text style={styles.actionText}>    CSS</Text>
                                </Icon>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={onPressJavascript}
                            >
                                <Icons name="logo-javascript" size={30} color="#637aff">
                                    <Text style={styles.actionText}>    JavaScript</Text>
                                </Icons>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </Modal>
            <View>
                <ScreenJourney tela={journey} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    color: {
        backgroundColor: '#141f20',

    },
    container: {
        backgroundColor: '#141f29',
        height: 1000
    },
    contant: {
        marginTop: 50,
        marginVertical: 20,
    },
    button: {
        zIndex: 99,
        backgroundColor: '#fff',
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0, 0.2)',
        backgroundColor: '#141f20',

        shadowColor: 'rgba(0,0,0, 0.3)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 5,
        shadowOpacity: 0.28,
        shadowRadius: 4,
    },
    actionText: {
        fontFamily: 'Roboto',
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
    },
    class: {
        height: 130,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: '#141f29',
        borderRadius: 20,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 7,
    },
    tinyLogo: {
        margin: 10,
        marginStart: 30,
        width: 100,
        height: 100,
    },
    tinyLogo2: {
        margin: 0,
        width: 120,
        height: 120,
    },
    title: {
        position: 'absolute',
        right: 30,
        top: 55,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
    },
    text: {
        position: 'absolute',
        right: 30,
        top: 85,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 15,
    },
    scroller: {
        marginHorizontal: 20,
        height: 630,
        paddingBottom: 500
    },
    header: {
        height: 50,
        elevation: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0, 0.2)',
        backgroundColor: '#141f20',

        shadowColor: 'rgba(0,0,0, 0.3)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 5,
        shadowOpacity: 0.28,
        shadowRadius: 4,
    },
    view: {
        marginHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
    },
    titleView: {
        color: 'white',
        flex: 1,
    },
    rightView: {
        justifyContent: 'flex-end',
    },
    rowView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
})
