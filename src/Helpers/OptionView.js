import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Modal, SafeAreaView, StyleSheet } from 'react-native';
import Icon, { Icons } from '../components/Icons';
import SaveClass from './SaveClass';
import OpButton from './OpButton';
import AText from './AText';
import Timer from './Timer';
import AHighlighter from './AHighlighter';

const textSize = 23;

export default function OptionView({ navigation, progresso, sec, adicionaltxt, pergunta, opt1,
    opt2, opt3, opt4, optCerta, navegar, aulaSalvar, Salvar, txtToHighlight=[""] }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const { colors } = useTheme(); //Variavel de cor do tema

    const [Select, setSelect] = useState('OptionButton')
    const [Select2, setSelect2] = useState('OptionButton')
    const [Select3, setSelect3] = useState('OptionButton')
    const [Select4, setSelect4] = useState('OptionButton')
    const [visibleModal, setVisibleModal] = useState('false')
    const [visibleModalE, setVisibleModalE] = useState('false')
    const [Textadd, setTextadd] = useState('Textadd')
    const [RightOpt, setRightOpt] = useState(false)
    const [RightOpt2, setRightOpt2] = useState(false)
    const [RightOpt3, setRightOpt3] = useState(false)
    const [RightOpt4, setRightOpt4] = useState(false)

    useEffect(() => {
        if (adicionaltxt != 'none')
            setTextadd('text')
        if (optCerta == 'opt1')
            setRightOpt(true)
        if (optCerta == 'opt2')
            setRightOpt2(true)
        if (optCerta == 'opt3')
            setRightOpt3(true)
        if (optCerta == 'opt4')
            setRightOpt4(true)
    }, [])

    const SelectTrue = () => {
        setSelect('OptionButtonTrue')
        setSelect2('OptionButton')
        setSelect3('OptionButton')
        setSelect4('OptionButton')
    }
    const SelectTrue2 = () => {
        setSelect2('OptionButtonTrue')
        setSelect('OptionButton')
        setSelect3('OptionButton')
        setSelect4('OptionButton')
    }
    const SelectTrue3 = () => {
        setSelect3('OptionButtonTrue')
        setSelect2('OptionButton')
        setSelect('OptionButton')
        setSelect4('OptionButton')
    }
    const SelectTrue4 = () => {
        setSelect4('OptionButtonTrue')
        setSelect2('OptionButton')
        setSelect3('OptionButton')
        setSelect('OptionButton')
    }
    const Verificar = () => {
        if (Select == 'OptionButtonTrue')
            if (RightOpt)
                setVisibleModal(true)
            else
                setVisibleModalE(true)
        else if (Select2 == 'OptionButtonTrue')
            if (RightOpt2)
                setVisibleModal(true)
            else
                setVisibleModalE(true)
        else if (Select3 == 'OptionButtonTrue')
            if (RightOpt3)
                setVisibleModal(true)
            else
                setVisibleModalE(true)
        else if (Select4 == 'OptionButtonTrue')
            if (RightOpt4)
                setVisibleModal(true)
            else
                setVisibleModalE(true)
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
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
                <Timer navigation={navigation} seconds={sec} />
                <SaveClass aulaSalvar={aulaSalvar} Salvar={Salvar} />
                <AHighlighter
                    style={[styles[Textadd], { color: colors.text }]}
                    highlight={{ color: "#637aff" }}
                    wordHighlight={txtToHighlight}
                    text={adicionaltxt}
                    defaultSize={textSize}
                />
                <AHighlighter
                    style={[styles.text, { color: colors.text }]}
                    highlight={{ color: "#637aff" }}
                    wordHighlight={txtToHighlight}
                    text={pergunta}
                    defaultSize={textSize}
                />
                <View>
                    <OpButton theme={Select} title={opt1} onPressFunction={() => SelectTrue()} />
                    <OpButton theme={Select2} title={opt2} onPressFunction={() => SelectTrue2()} />
                    <OpButton theme={Select3} title={opt3} onPressFunction={() => SelectTrue3()} />
                    <OpButton theme={Select4} title={opt4} onPressFunction={() => SelectTrue4()} />
                </View>
            </View>
            <OpButton theme={"nextButton"} title={t("verify")} onPressFunction={() => Verificar()} />

            <Modal
                visible={visibleModal}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={[styles.contant, { backgroundColor: colors.card }]}>
                        <AText style={[styles.textModal, { color: colors.text }]} defaultSize={textSize}>{t("congrats")}</AText>
                        <OpButton theme={"modalButton"} title={t("continue")} onPressFunction={() => navigation.navigate(navegar)} />
                    </View>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={visibleModalE}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={[styles.contant, { backgroundColor: colors.card }]}>
                        <AText style={[styles.textModal, { color: colors.text }]} defaultSize={textSize}>{t("oh no")}</AText>
                        <OpButton theme={"modalButtonE"} title={t("try again")} onPressFunction={() => setVisibleModalE(false)} />
                    </View>
                </SafeAreaView>
            </Modal>
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

})
