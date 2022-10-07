import React from 'react';
import {
    SafeAreaView,
    Text,
    StyleSheet,
} from 'react-native';


export default function Config () {
    return (
        <SafeAreaView>
            <Text styles={styles.body}>Teste config</Text>
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