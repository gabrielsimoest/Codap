import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import OpButton from '../../Helpers/OpButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import AText from '../../Helpers/AText';
import { useTranslation } from 'react-i18next';

const TitleTextSize = 23;
const textSize = 15;

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
            <TouchableOpacity
                onPress={toggleExpanded}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module1c")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("concepts of CSS")}</AText>
                <Image style={styles.figure} source={require('../../../assets/Robo_basics.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed1}>
                <View style={{ flexDirection: "row" }} >
                    <OpButton theme={"classButton"} title="Teste" />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton theme={"classButton"} title="Teste" />
                </View>
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
            <TouchableOpacity
                onPress={toggleExpanded2}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module2c")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("intermediate CSS")}</AText>
                <Image style={styles.figure2} source={require('../../../assets/Robo_inter.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed2}>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={"ADICIONANDOBORDAS"} theme={"classButton"} title="Adicionando Bordas" onPressFunction={() => navigation.navigate('AdicionandoBordas')} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={"COLOCANDOMARGIN"} theme={"classButton"} title="Colocando Margin" onPressFunction={() => navigation.navigate('ColocandoMargin')} />
                </View>
                <View style={{ flexDirection: "row" }} >
                    <OpButton AulasSalvarOp={AulasSalvas} Verify={"ADICIONANDOPADDING"} theme={"classButton"} title="Adicionando Padding" onPressFunction={() => navigation.navigate('AdicionandoPadding')} />
                </View>
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
            <TouchableOpacity
                onPress={toggleExpanded3}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module3c")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("advanced CSS")}</AText>
                <Image style={styles.figure3} source={require('../../../assets/Robo_advanced.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed3}>
                <View>
                    <Text style={[{ color: colors.text, fontSize: 20, margin: 20 }]}>Opss, Ainda não foram encontradas aulas para esse módulo</Text>
                </View>
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
            <TouchableOpacity
                onPress={toggleExpanded4}
                style={[styles.class, { backgroundColor: colors.primary }]}
            >
                <AText style={[styles.title, { color: colors.text }]} defaultSize={TitleTextSize}>{t("module4c")}</AText>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{t("mastery in CSS")}</AText>
                <Image style={styles.figure3} source={require('../../../assets/Robo_master.png')} />
            </TouchableOpacity>
            <Collapsible collapsed={collapsed4}>
                <View>
                    <Text style={[{ color: colors.text, fontSize: 20, margin: 20 }]}>Opss, Ainda não foram encontradas aulas para esse módulo</Text>
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
        height: 140,
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
    figure: {
        top: -70,
        left: -50,
        width: 240,
        height: 240,
    },
    figure2: {
        top: -70,
        left: -35,
        width: 240,
        height: 240,
    },
    figure3: {
        top: -45,
        left: -60,
        width: 240,
        height: 240,
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
