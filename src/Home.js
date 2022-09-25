import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Keyboard,
    Image
} from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export default function Home({ navigation }) {

    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.container}>
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.box}>
                    <View style={styles.logoHeader}>
                    <View style={styles.header}>
                        <Image style={styles.tinyLogo} source={require('../assets/code.png')} />
                        <Text style={styles.title}>Codap</Text>
                    </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 30,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        flexDirection: 'row',
    },
    tinyLogo: {
        marginTop: '2.2%',
        width: 60,
        height: 60,
    },
    box: {
        backgroundColor: "rgba(10, 10, 10, 0.9)",
        height: '100%',
        width: 1000,
        alignItems: 'center',
    },
    title: {
        marginLeft: 10,
        marginTop: '2.5%',
        fontSize: 40,
        fontWeight: 'bold',
        color: "#7977FD"
    },
    logoHeader: {
        backgroundColor: "rgba(5, 5, 5, 0.95)",
        height: '16%',
        width: '45%',
        marginTop: -20,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: "#939393",
        alignItems: 'center',

   } 
})
