import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Keyboard,
    Image,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';

import Panel from './components/Panel';

export default function Testes({ navigation }) {

    return (
            <Panel title= "teste">
                <Text>teste</Text>
            </Panel>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 20,
        color: "#9D9D9D",
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
        width: '100%',
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
        width: '110%',
        right: '5%',
        marginTop: -20,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: "#939393",
        alignItems: 'center',

    },
    scrollview: {
        width: '90%',
        marginLeft: '5%',
        marginBottom: '16%',
    },
    subjectIndicator: {
        backgroundColor: "rgba(5, 5, 5, 0.90)",
        alignItems: "center",
        justifyContent: "space-evenly",
        borderColor: "#9D9D9D",
        borderWidth: 1,
        borderRadius: 10,
        borderTopEndRadius: 80,
        borderTopStartRadius: 0,
        width: "100%",
        height: 100,
        marginTop: 10,
    }
})