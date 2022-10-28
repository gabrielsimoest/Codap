import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, } from 'react-native';
import HeaderShop from '../components/HeaderShop';
import SQLite from 'react-native-sqlite-storage';
import OpButton from '../Helpers/OpButton';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "@react-navigation/native"

export default function Store() {
<<<<<<< Updated upstream
=======

    const {colors} = useTheme(); //Variavel de cor do tema

    const [getData, setgetData] = useState(false);
>>>>>>> Stashed changes
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
            <Text style={[styles.headert, {color: colors.text}]}>COMPRE COM DEPENDABOTS</Text>
            <View style={[styles.list, {backgroundColor: colors.primary}]}>
                <Image style={styles.tinyLogo} source={require('../../assets/potion.png')} />
                <Text style={[styles.textL, {color: colors.text}]}>Dobro de Experiencia</Text>
                <View style={styles.button}>
                    <OpButton theme={"marketButton"} title="COMPRAR" />
                </View>
            </View>
            <View style={[styles.list, {backgroundColor: colors.primary}]}>
                <Text style={[styles.textL2, {color: colors.text}]}>Baú Surpresa</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/CaixaSurpresa.png')} />
                <OpButton theme={"marketButton2"} title="COMPRAR" />
            </View>
            <View style={[styles.list, {backgroundColor: colors.primary}]}>
                <Image style={styles.tinyLogo3} source={require('../../assets/Time.png')} />
                <Text style={[styles.textL, {color: colors.text}]}>Dobro de Tempo</Text>
                <View style={styles.button}>
                    <OpButton theme={"marketButton"} title="COMPRAR" />
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