import React, { useState } from 'react';
import { View, StyleSheet, Text, } from 'react-native';
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
        
    }

})
