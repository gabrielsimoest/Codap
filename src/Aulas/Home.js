import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Keyboard,
    Image
} from 'react-native';

export default function Home({ navigation }) {

    return (
        <View styles={styles.body}>
            <Text>TESTE</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    body: {
        backgroundColor:'#353437',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    
})
