import { useFocusEffect, useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View, TouchableOpacity, Modal, SafeAreaView, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import Icon, { Icons } from '../components/Icons';
import OpButton from './OpButton';
import AText from './AText';

const textSize = 23;
const optSize = 15;

var text = ""
var disable = false
var disable2 = false
var disable3 = false
var disable4 = false
var disable5 = false
var disable6 = false
var disable7 = false
var disable8 = false
var disableopt = 'opt'
var disableopt2 = 'opt'
var disableopt3 = 'opt'
var disableopt4 = 'opt'
var disableopt5 = 'opt'
var disableopt6 = 'opt'
var disableopt7 = 'opt'
var disableopt8 = 'opt'

export default function SelectView({ navigation, progresso, adicionaltxt, pergunta, opt1, opt2, opt3, opt4, opt5, opt6, opt7, opt8, txtCerto, navegar }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const { colors } = useTheme(); //Variavel de cor do tema
    
    const [visibleModal, setVisibleModal] = useState('false')
    const [visibleModalE, setVisibleModalE] = useState('false')
    const [Textadd, setTextadd] = useState('Textadd')
    const [Textopt5, setTextopt5] = useState('Textadd')
    const [Textopt6, setTextopt6] = useState('Textadd')
    const [Textopt7, setTextopt7] = useState('Textadd')
    const [Textopt8, setTextopt8] = useState('Textadd')
    const [Texto, setText] = useState('')


    useFocusEffect(
        React.useCallback(() => {
            if (adicionaltxt != "none")
                setTextadd('text')
            if (opt5 != "none")
                setTextopt5('display')
            if (opt6 != "none")
                setTextopt6('display')
            if (opt7 != "none")
                setTextopt7('display')
            if (opt8 != "none")
                setTextopt8('display')

            text = ""
            setText(text)
            disable = false
            disable2 = false
            disable3 = false
            disable4 = false
            disable5 = false
            disable6 = false
            disable7 = false
            disable8 = false
            disableopt = 'opt'
            disableopt2 = 'opt'
            disableopt3 = 'opt'
            disableopt4 = 'opt'
            disableopt5 = 'opt'
            disableopt6 = 'opt'
            disableopt7 = 'opt'
            disableopt8 = 'opt'
        }, [])
    );

    function Erase() {
        text = ""
        setText(text)
        disable = false
        disable2 = false
        disable3 = false
        disable4 = false
        disable5 = false
        disable6 = false
        disable7 = false
        disable8 = false
        disableopt = 'opt'
        disableopt2 = 'opt'
        disableopt3 = 'opt'
        disableopt4 = 'opt'
        disableopt5 = 'opt'
        disableopt6 = 'opt'
        disableopt7 = 'opt'
        disableopt8 = 'opt'
    }

    function ShowText(param) {

        if (param == 1) {
            text = text + opt1
            disable = true
            disableopt = 'optDisabled'
        }

        if (param == 2) {
            text = text + opt2
            disable2 = true
            disableopt2 = 'optDisabled'
        }
        if (param == 3) {
            text = text + opt3
            disable3 = true
            disableopt3 = 'optDisabled'
        }
        if (param == 4) {
            text = text + opt4
            disable4 = true
            disableopt4 = 'optDisabled'
        }
        if (param == 5) {
            text = text + opt5
            disable5 = true
            disableopt5 = 'optDisabled'
        }
        if (param == 6) {
            text = text + opt6
            disable6 = true
            disableopt6 = 'optDisabled'
        }
        if (param == 7) {
            text = text + opt7
            disable7 = true
            disableopt7 = 'optDisabled'
        }
        if (param == 8) {
            text = text + opt8
            disable8 = true
            disableopt8 = 'optDisabled'
        }

        setText(text)
    }

    const Verificar = () => {
        if (Texto == txtCerto)
            setVisibleModal(true)
        else
            setVisibleModalE(true)
    }

    return (
        <View style={[styles.container, {backgroundColor: colors.card}]}>
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
                <AText style={[styles[Textadd], {color: colors.text}]} defaultSize={textSize}>{adicionaltxt}</AText>
                <AText style={[styles.text, {color: colors.text}]} defaultSize={textSize}>{pergunta}</AText>
                <View style={[styles.code, {backgroundColor: colors.background}]}>
                    <View><AText style={[styles.textcode, {color: colors.text}]} defaultSize={optSize}>{Texto}</AText></View>
                </View>
                <TouchableOpacity
                    onPress={() => Erase()}
                >
                    <Icon
                        type={Icons.Entypo}
                        name="erase"
                        color={"#33526E"}
                        size={30}
                        style={styles.erase}
                    />
                </TouchableOpacity>
            </View>

            <View style={[styles.options, {backgroundColor: colors.background}]}>
                <TouchableOpacity onPress={() => ShowText(1)} disabled={disable}>
                    <View style={styles[disableopt]}><Text style={styles.textopt}>{opt1}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => ShowText(2)} disabled={disable2}>
                    <View style={styles[disableopt2]}><Text style={styles.textopt}>{opt2}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => ShowText(3)} disabled={disable3}>
                    <View style={styles[disableopt3]}><Text style={styles.textopt}>{opt3}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => ShowText(4)} disabled={disable4}>
                    <View style={styles[disableopt4]}><Text style={styles.textopt}>{opt4}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => ShowText(5)} style={[styles[Textopt5]]} disabled={disable5}>
                    <View style={styles[disableopt5]}><Text style={styles.textopt}>{opt5}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => ShowText(6)} style={[styles[Textopt6]]} disabled={disable6}>
                    <View style={styles[disableopt6]}><Text style={styles.textopt}>{opt6}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => ShowText(7)} style={[styles[Textopt7]]} disabled={disable7}>
                    <View style={styles[disableopt7]}><Text style={styles.textopt}>{opt7}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => ShowText(8)} style={[styles[Textopt8]]} disabled={disable8}>
                    <View style={styles[disableopt8]}><Text style={styles.textopt}>{opt8}</Text></View>
                </TouchableOpacity>
            </View>
            <Modal
                visible={visibleModal}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={[styles.contant, {backgroundColor: colors.card}]}>
                        <AText style={[styles.textModal, {color: colors.text}]} defaultSize={textSize}>{t("congrats")}</AText>
                        {<OpButton theme={"modalButton"} title={t("continue")} onPressFunction={() => navigation.navigate(navegar)} />}
                    </View>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={visibleModalE}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={[styles.contant, {backgroundColor: colors.card}]}>
                        <AText style={[styles.textModal, {color: colors.text}]} defaultSize={textSize}>{t("oh no")}</AText>
                        <OpButton theme={"modalButtonE"} title={t("try again")} onPressFunction={() => setVisibleModalE(false)} />
                    </View>
                </SafeAreaView>
            </Modal>
            <View style={[styles.background, {backgroundColor: colors.background}]}>
            </View>
            <OpButton theme={"nextButton"} title={t("verify")} onPressFunction={() => Verificar()} />
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
    erase: {
        position: 'absolute',
        right: 0,
        margin: 13
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
        margin: 8,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 15,
        fontWeight: "bold"
    },
    options: {
        paddingTop: '5%',
        position: 'absolute',
        bottom: '13%',
        backgroundColor: '#141f29',
        width: '100%',
        flexWrap: 'wrap',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'row',
        height: '16%',
        paddingLeft: '12%',
        paddingRight: '10%',
    },
    opt: {
        backgroundColor: '#637aff',
        alignItems: 'center',
        borderRadius: 10,
        maxHeight: '40%',
        margin: '3%',
    },
    optDisabled: {
        backgroundColor: 'gray',
        alignItems: 'center',
        borderRadius: 10,
        maxHeight: '40%',
        margin: '3%',
    },
    display: {
        alignItems: 'center',
        marginTop: 5
    }
})
