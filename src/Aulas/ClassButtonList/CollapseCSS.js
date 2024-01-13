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
import AsyncStorage from '@react-native-async-storage/async-storage';
import AText from '../../components/Shared/AText';
import { useTranslation } from 'react-i18next';

const TitleTextSize = 23;
const textSize = 15;
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function CollapseCSS() {

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
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module1c")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("concepts of CSS")}</AText>
                <Image style={styles.basicImg} source={require('../../../assets/Robo_basics.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed1}>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={3} theme={"classButton"} title={t("Discovering CSS")} onPressFunction={() => navigation.navigate("ConhecendoCSS")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={2} theme={"classButton"} title={t("Using colors")} onPressFunction={() => navigation.navigate("ColorCSS")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={1} theme={"classButton"} title={t("Adding background color")} onPressFunction={() => navigation.navigate("BackgroundColorCSS")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={5} theme={"classButton"} title={t("Adjusting font size")} onPressFunction={() => navigation.navigate("FontSizeCSS")} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={4} theme={"classButton"} title={t("Changing font family")} onPressFunction={() => navigation.navigate("FontFamilyCSS")} />
                </View>
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
            {/*******************INTER***********************/}
            <TouchableOpacity
                onPress={toggleExpanded2}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module2c")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("intermediate CSS")}</AText>
                <Image style={styles.commonImg} source={require('../../../assets/Robo_pensativo.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed2}>
                {/*                 <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={6} theme={"classButton"} title={t("Adding borders")} onPressFunction={() => navigation.navigate('AdicionandoBordas')} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={8} theme={"classButton"} title={t("Putting margin")} onPressFunction={() => navigation.navigate('ColocandoMargin')} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={7} theme={"classButton"} title={t("Adding padding")} onPressFunction={() => navigation.navigate('AdicionandoPadding')} />
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
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module3c")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("advanced CSS")}</AText>
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
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module4c")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("mastery in CSS")}</AText>
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
