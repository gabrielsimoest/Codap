import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, } from 'react-native';
import HeaderShop from '../components/HeaderShop';
import Icon from 'react-native-vector-icons/Fontisto';
import Icons from 'react-native-vector-icons/Ionicons';
import OpButton from '../Helpers/OpButton';

//MOEDA DE TROCA: BOTS

export default function Store() {
    const [visibleModal, setVisibleModal] = useState(false)

    return (
        <View style={styles.container}>
            <HeaderShop />
            <Text style={styles.headert}>COMPRE COM DEPENDABOTS</Text>
            <View style={styles.list}>
                <Image style={styles.tinyLogo} source={require('../../assets/potion.png')} />
                <Text style={styles.textL}>Dobro de Experiencia</Text>
                <View style={styles.button}>
                    <OpButton theme={"marketButton"} title="COMPRAR" />
                </View>
            </View>
            <View style={styles.list}>
                <Text style={styles.textL2}>Baú Surpresa</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/CaixaSurpresa.png')} />
                <OpButton theme={"marketButton2"} title="COMPRAR" />
            </View>
            <View style={styles.list}>
                <Image style={styles.tinyLogo3} source={require('../../assets/Time.png')} />
                <Text style={styles.textL3}>Dobro de Tempo</Text>
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