import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, } from 'react-native';
import HeaderShop from '../components/HeaderShop';
import Icon from 'react-native-vector-icons/Fontisto';
import Icons from 'react-native-vector-icons/Ionicons';

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
            </View>
            <View style={styles.list}>
                <Text style={styles.textL2}>Dobro de Experiencia</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/Chest.png')} />

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
        fontFamily: 'Roboto',
        textAlign: 'center'
    },
    list: {
        backgroundColor: '#141f29',
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
        height: 170,
        margin: 10,
        elevation: 2
    },
    tinyLogo: {
        margin: 10,
        width: 108,
        height: 153,
    },
    tinyLogo2: {
        position: 'absolute',
        right: 20,
        top:20,
        width: 132,
        height: 106,
    },
    textL:{
        color:'#fff',
        position:'absolute',
        fontSize: 22,
        right:15,
        top:38
    }

})