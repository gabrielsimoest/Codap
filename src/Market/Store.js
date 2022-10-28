import React, { useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import HeaderShop from '../components/HeaderShop';
import SQLite from 'react-native-sqlite-storage';
import OpButton from '../Helpers/OpButton';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "@react-navigation/native"
import AText from '../Helpers/AText';
import { useTranslation } from 'react-i18next';

const headerTextSize = 25;
const textSize = 20;

export default function Store() {

    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const {colors} = useTheme(); //Variavel de cor do tema

    const [Dependa, setDependa] = useState('');
    const [XP, setXP] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            getUser();
        }, [])
    );

    const getUser = async () => {
        const storageDependa = await AsyncStorage.getItem('DependaBots');
        const storageXP = await AsyncStorage.getItem('XP');
        setXP(storageXP);
        setDependa(storageDependa);
    }

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <HeaderShop dependa={Dependa}/>
            <Text style={[styles.headert, {color: colors.text}]}>{t("buy using dependabots")}</Text>
            <View style={[styles.list, {backgroundColor: colors.primary}]}>
                <Image style={styles.tinyLogo} source={require('../../assets/potion.png')} />
                <AText style={[styles.textL, {color: colors.text}]} defaultSize={textSize}>{t("double experience")}</AText>
                <View style={styles.button}>
                    <OpButton theme={"marketButton"} title={t("buy")} />
                </View>
            </View>
            <View style={[styles.list, {backgroundColor: colors.primary}]}>
                <AText style={[styles.textL2, {color: colors.text}]} defaultSize={textSize}>{t("surprise chest")}</AText>
                <Image style={styles.tinyLogo2} source={require('../../assets/CaixaSurpresa.png')} />
                <OpButton theme={"marketButton2"} title={t("buy")} />
            </View>
            <View style={[styles.list, {backgroundColor: colors.primary}]}>
                <Image style={styles.tinyLogo3} source={require('../../assets/Time.png')} />
                <AText style={[styles.textL3, {color: colors.text}]} defaultSize={textSize}>{t("double time")}</AText>
                <View style={styles.button}>
                    <OpButton theme={"marketButton"} title={t("buy")} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#141f29',
        height: 1000
    },
    headert: {
        margin: 10,
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        textAlign: 'center'
    },
    list: {
        backgroundColor: '#1B2B39',
        borderRadius: 10,
        height: 170,
        margin: 10,
        elevation: 7
    },
    tinyLogo: {
        margin: 10,
        width: 108,
        height: 153,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 20,
    },
    tinyLogo2: {
        position: 'absolute',
        right: 20,
        top: 20,
        width: 120,
        height: 133,
    },
    tinyLogo3: {
        margin: 10,
        width: 120,
        height: 137,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 20,
    },
    textL: {
        color: '#fff',
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        right: 40,
        top: 38
    },
    textL2: {
        color: '#fff',
        fontWeight: 'bold',
        position: 'absolute',
        fontFamily: 'Roboto',
        fontSize: 20,
        left: 45,
        top: 38
    },
    textL3: {
        color: '#fff',
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        right: 60,
        top: 38
    },

})