import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Modal, SafeAreaView, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import Icon, { Icons } from '../components/Icons';
import OpButton from './OpButton';

export default function SelectView({ navigation, progresso, adicionaltxt, pergunta, opt1, opt2, opt3, opt4, optCerta, navegar }) {
    const [visibleModal, setVisibleModal] = useState('false')
    const [visibleModalE, setVisibleModalE] = useState('false')
    const [Textadd, setTextadd] = useState('Textadd')

    useEffect(() => {
        if (adicionaltxt != "none")
            setTextadd('text')
    }, [])

    const Verificar = () => {

    }

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.progressBar}><View style={[StyleSheet.absoluteFill, { backgroundColor: "#637aff", width: progresso }]} /></View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                >
                    <Icon
                        type={Icons.Ionicons}
                        name="ios-close-outline"
                        color={"#33526E"}
                        size={60}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <Text style={[styles[Textadd]]}>{adicionaltxt}</Text>
                <Text style={styles.text}>{pergunta}</Text>
                <View style={styles.code}>
                    <View><Text style={styles.textcode}>asjdhajksd</Text></View>
                </View>
            </View>

            <View style={styles.options}>
                <TouchableOpacity>
                    <View style={styles.opt}><Text style={styles.textopt}>{opt1}</Text></View>
                </TouchableOpacity>
                <View style={styles.opt}><Text style={styles.textopt}>{opt2}</Text></View>
                <View style={styles.opt}><Text style={styles.textopt}>{opt3}</Text></View>
                <View style={styles.opt}><Text style={styles.textopt}>{opt4}</Text></View>
                <View style={styles.opt}><Text style={styles.textopt}>{opt4}</Text></View>
                <View style={styles.opt}><Text style={styles.textopt}>{opt4}</Text></View>
                <View style={styles.opt}><Text style={styles.textopt}>{opt4}</Text></View>
                <View style={styles.opt}><Text style={styles.textopt}>{opt4}</Text></View>
            </View>
            <Modal
                visible={visibleModal}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={styles.contant}>
                        <Text style={styles.textModal}>Parabéns, Você está certo!</Text>
                        <OpButton theme={"modalButton"} title="Continuar" onPressFunction={() => navigation.navigate(navegar)} />
                    </View>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={visibleModalE}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={styles.contant}>
                        <Text style={styles.textModal}>Ahh não, Você errou!</Text>
                        <OpButton theme={"modalButtonE"} title="Tentar Novamente" onPressFunction={() => setVisibleModalE(false)} />
                    </View>
                </SafeAreaView>
            </Modal>
            <View style={styles.background}>
            </View>
            <OpButton theme={"nextButton"} title="Verificar" onPressFunction={() => Verificar()} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#0E151C',
    },
    scroller: {
        marginHorizontal: 5,
        marginVertical: 10,
        height: 630,
        paddingBottom: 500,
    },
    box: {
        marginLeft: "1.5%",
        marginTop: 5,
        backgroundColor: '#141f29',
        borderColor: 'rgba(99, 122, 255, 0.2)',
        height: "92%",
        width: "97%",
    },
    text: {
        margin: 20,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
        fontWeight: "bold"
    },
    image: {
        margin: 10,
        height: 230,
        width: 310,
    }
    ,
    image2: {
        borderRadius: 10,
        margin: 10,
        height: 35,
        width: 310,
    },
    image3: {
        margin: 10,
        height: 100,
        width: 350,
    },
    image4: {
        margin: 10,
        height: 100,
        width: 350,
    },
    icon: {
        marginRight: 20,
        top: 10,
    },
    contant: {
        marginTop: 600,
        marginBottom: 50,
        marginVertical: 20,
        zIndex: 99,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0, 0.2)',
        backgroundColor: '#0E151C',

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
    textModal: {
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
        fontWeight: "bold"
    },
    Textadd: {
        display: 'none'
    },
    progressBar: {
        top: -2,
        height: 8,
        width: '100%',
        backgroundColor: 'white',
    },
    code: {
        backgroundColor: '#141f29',
        width: '100%',
        height: 120,
    },
    background: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#141f29',
        width: '100%',
        height: '13%',
    },
    textcode: {
        margin: 10,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 15,
        fontWeight: "bold"
    },
    textopt: {
        margin: 5,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 17,
        fontWeight: "bold"
    },
    options: {
        position: 'absolute',
        bottom: '13%',
        backgroundColor: '#141f29',
        width: '100%',
        flexWrap: 'wrap',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'row',
        height: '16%',
        paddingLeft: 50,
        paddingRight: 40,
    },
    opt: {
        backgroundColor: 'gray',
        alignItems: 'center',
        borderRadius: 10,
        maxHeight: '30%',
        margin: '3%',
    }
})
