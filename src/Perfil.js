import React from 'react';
import {
    SafeAreaView,
    Text,
    StyleSheet,
} from 'react-native';


export default function Perfil () {
    return (
        <SafeAreaView  styles={styles.body}>
            <Text>Teste perfil</Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    body: {
        color: "black",
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 30,
    }
})