import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View, TouchableOpacity, Modal, SafeAreaView, StyleSheet, Keyboard } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { TextInput } from 'react-native-paper';
import Icon, { Icons } from '../components/Icons';
import Timer from './Timer';
import OpButton from './OpButton';
import AText from './AText';
import SaveClass from './SaveClass';
import AHighlighter from './AHighlighter';

const textSize = 23;
const optSize = 20;

export default function TextView({ navigation, progresso, sec, adicionaltxt, pergunta, txtantes,
    txtdepois, txtCerto1, txtCerto2, txtCerto3, tamanhoInput, navegar, aulaSalvar, Salvar, txtToHighlight=[""] }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const { colors } = useTheme(); //Variavel de cor do tema

    const [visibleModal, setVisibleModal] = useState('false')
    const [visibleModalE, setVisibleModalE] = useState('false')
    const [Textadd, setTextadd] = useState('Textadd')
    const [InputText, setInputText] = useState('');
    const [TEXTO, setTEXTO] = useState('');

    useEffect(() => {
        if (adicionaltxt != 'none')
            setTextadd('text')
    }, [])

    const Verificar = () => {
        setTEXTO(InputText)
        if (InputText == txtCerto1 || InputText == txtCerto2 || InputText == txtCerto3)
            setVisibleModal(true)
        else
            setVisibleModalE(true)
    }

    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss} accessible={false}
        >
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
                    <SaveClass aulaSalvar={aulaSalvar} Salvar={Salvar} />
                    <Timer navigation={navigation} seconds={sec} />
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
                    <View style={[styles.txtarea, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.textopt, { color: colors.text }]}>{txtantes}</Text>
                        <TextInput style={[styles.input, { width: tamanhoInput }]} onChangeText={(value) => setInputText(value)}></TextInput>
                        <Text style={[styles.textopt, { color: colors.text }]}>{txtdepois}</Text>
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
        </TouchableWithoutFeedback>
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
    txtarea: {
        backgroundColor: '#141f29',
        width: '100%',
        flexWrap: 'wrap',
        alignItems: 'center',
        flexDirection: 'row',
    },
    textopt: {
        margin: 9,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 20,
        fontWeight: "bold"
    },
    input: {
        height: 30,
        borderRadius: -20
    }

})
