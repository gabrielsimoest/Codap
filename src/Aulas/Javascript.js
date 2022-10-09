
import React, { useState } from 'react';
import { TouchableOpacity, Text, ScrollView, Image, StyleSheet } from 'react-native';

export default function Javascript() {
    return (
        <ScrollView style={styles.scroller} >
            <TouchableOpacity
                style={styles.class}
                onPress={() => { }}
            >
                <Text style={styles.title}>Aula 1</Text>
                <Text style={styles.text}>Conceitos basicos de JS</Text>
                <Image style={styles.tinyLogo} source={require('../../assets/Astronauta.png')} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.class}
                onPress={() => { }}
            >
                <Text style={styles.title}>Aula 2</Text>
                <Text style={styles.text}>Conceitos médios</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/yoga.png')} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.class}
                onPress={() => { }}
            >
                <Text style={styles.title}>Aula 3</Text>
                <Text style={styles.text}>Conceitos avançados</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/fox.png')} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.class}
                onPress={() => { }}
            >
                <Text style={styles.title}>Aula 4</Text>
                <Text style={styles.text}>Master Class</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/cat.png')} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.class}
                onPress={() => { }}
            >
                <Text style={styles.title}>Aula 4</Text>
                <Text style={styles.text}>Master Class</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/cat.png')} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.class}
                onPress={() => { }}
            >
                <Text style={styles.title}>Aula 4</Text>
                <Text style={styles.text}>Master Class</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/cat.png')} />
            </TouchableOpacity>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    color: {
        backgroundColor: '#141f20',

    },
    container: {
        backgroundColor: '#141f29',
        height: 1000
    },
    contant: {
        marginTop: 50,
        marginVertical: 20,
    },
    button: {
        zIndex: 99,
        backgroundColor: '#fff',
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0, 0.2)',
        backgroundColor: '#141f20',

        shadowColor: 'rgba(0,0,0, 0.3)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 5,
        shadowOpacity: 0.28,
        shadowRadius: 4,
    },
    actionText: {
        fontFamily: 'Roboto',
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
    },
    class: {
        height: 130,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: '#141f29',
        borderRadius: 20,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 7,
    },
    tinyLogo: {
        margin: 10,
        marginStart: 30,
        width: 100,
        height: 100,
    },
    tinyLogo2: {
        margin: 0,
        width: 120,
        height: 120,
    },
    title: {
        position: 'absolute',
        right: 30,
        top: 55,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
    },
    text: {
        position: 'absolute',
        right: 30,
        top: 85,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 15,
    },
    scroller: {
        marginHorizontal: 20,
        height: 630,
        paddingBottom: 500
    },

})