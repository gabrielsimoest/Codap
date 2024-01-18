import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import OpButton from '../../components/Shared/OpButton';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import AText from '../../components/Shared/AText';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TitleTextSize = 23;
const textSize = 15;
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function CollapseJS() {

    //Salvar aulas
    const [AulasSalvas, setAulasSalvas] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            getUser();
        }, [])
    );

    const getUser = async () => {
        const storageAulasSalvas = await AsyncStorage.getItem('Aulas');
        setAulasSalvas(storageAulasSalvas);
    }

    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const { colors } = useTheme(); //Cores do tema

    const navigation = useNavigation();

    var [collapsed1, setState] = useState(true);
    var [collapsed2, setState2] = useState(true);
    var [collapsed3, setState3] = useState(true);
    var [collapsed4, setState4] = useState(true);

    var toggleExpanded = () => {
        setState(collapsed1 = !collapsed1);
    };
    var toggleExpanded2 = () => {
        setState2(collapsed2 = !collapsed2);
    };
    var toggleExpanded3 = () => {
        setState3(collapsed3 = !collapsed3);
    };
    var toggleExpanded4 = () => {
        setState4(collapsed4 = !collapsed4);
    };
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/*******************BASIC***********************/}
            <TouchableOpacity
                onPress={toggleExpanded}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module1j")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("concepts of JavaScript")}</AText>
                <Image style={styles.basicImg} source={require('../../../assets/Robo_basics.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed1}>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={29} theme={"classButton"} title={t("Discovering JavaScript")} onPressFunction={() => navigation.navigate("ConhecendoJS")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={32} theme={"classButton"} title={t("JavaScript variables")} onPressFunction={() => navigation.navigate("Variaveis")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={31} theme={"classButton"} title={t("Data types")} onPressFunction={() => navigation.navigate("TiposDados")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={28} theme={"classButton"} title={t("Adding interactions")} onPressFunction={() => navigation.navigate("Interações")} />
                </View>
                {/*                 <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={30} theme={"classButton"} title={t("Converting types")} onPressFunction={() => navigation.navigate("ConvertendoTipos")} />
                </View> */}
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
            {/*******************INTER***********************/}
            <TouchableOpacity
                onPress={toggleExpanded2}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module2j")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("intermediate JavaScript")}</AText>
                <Image style={styles.commonImg} source={require('../../../assets/Robo_pensativo.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed2}>
                {/*                 <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={33} theme={"classButton"} title={t("Basic operators and maths")} onPressFunction={() => navigation.navigate("Operadores")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={34} theme={"classButton"} title={t("Comparisons")} onPressFunction={() => navigation.navigate("Comparação")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={36} theme={"classButton"} title={t("Logic functions")} onPressFunction={() => navigation.navigate("IfElse")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={35} theme={"classButton"} title={t("Creating loops")} onPressFunction={() => navigation.navigate("WhileFor")} />
                </View> */}
                <Text style={[{ color: colors.text, fontSize: 20, margin: 20, textAlign: "center" }]}>{t("Oops")}</Text>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        style={styles.comingSoonImg}
                        source={require('../../../assets/Robo_triste.png')}
                    />
                </View>
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
            {/*******************ADVANCED***********************/}
            <TouchableOpacity
                onPress={toggleExpanded3}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module3j")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("advanced JavaScript")}</AText>
                <Image style={styles.commonImg} source={require('../../../assets/Robo_feliz.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed3}>
                <Text style={[{ color: colors.text, fontSize: 20, margin: 20, textAlign: "center" }]}>{t("Oops")}</Text>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        style={styles.comingSoonImg}
                        source={require('../../../assets/Robo_triste.png')}
                    />
                </View>
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
            {/*******************MASTERY***********************/}
            <TouchableOpacity
                onPress={toggleExpanded4}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module4j")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("mastery in JavaScript")}</AText>
                <Image style={styles.masterImg} source={require('../../../assets/Robo_master.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed4}>
                <Text style={[{ color: colors.text, fontSize: 20, margin: 20, textAlign: "center" }]}>{t("Oops")}</Text>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        style={styles.comingSoonImg}
                        source={require('../../../assets/Robo_triste.png')}
                    />
                </View>
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141f29',
    },
    class: {
        height: windowHeight * 0.19,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 15,
        marginBottom: 15,
        backgroundColor: '#1B2B39',
        borderRadius: 20,
        elevation: 7,
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
    basicImg: {
        top: 0,
        left: windowWidth * 0.065,
        width: windowWidth * 0.185,
        height: windowHeight * 0.185,
    },
    commonImg: {
        left: windowWidth * 0.065,
        width: windowWidth * 0.189,
        height: windowHeight * 0.189,
    },
    masterImg: {
        left: windowWidth * 0.04,
        width: windowWidth * 0.25,
        height: windowHeight * 0.18,
    },
    comingSoonImg: {
        width: windowWidth * 0.25,
        height: windowHeight * 0.25,
        right: windowWidth * 0.01,
    },
    icon: {
        left: 25,
        marginRight: 20,
        top: 20,
    },
    line: {
        borderBottomWidth: 2,
        borderColor: '#1B2B39',
        margin: 20,
        marginLeft: 15,
        marginRight: 15
    }
});
