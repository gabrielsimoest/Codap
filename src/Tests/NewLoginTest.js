import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    Alert,
    Keyboard
} from 'react-native';
import CustomButton from '../components/Shared/CustomButton';
import SQLite from 'react-native-sqlite-storage';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage'



export default function NewLoginTest({ navigation }) {
    const onPressHandler = () => {
        navigation.navigate('TestRegister')
    }

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss} accessible={false}
            >
                <View style={styles.shade}>
                    <View style={styles.box}>
                        <View style={styles.header}>
                            <Image style={styles.tinyLogo} source={require('../../assets/code.png')} />
                            <Text style={styles.title}>Codap</Text>
                        </View>
                        <View>
                            <TextInput
                                autoCapitalize='none'
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={"#7977FD"}
                            //onChangeText={(value) => setEmail(value)}
                            />
                            <TextInput
                                autoCapitalize='none'
                                style={styles.input}
                                placeholder="Senha"
                                placeholderTextColor={"#7977FD"}
                                //onChangeText={(value) => setSenha(value)}
                                secureTextEntry={true}
                            />
                            <CustomButton
                                title='Login'
                                color="#7977FD"
                            //onPressFunction={setData}
                            />
                            <Image style={styles.image} source={require('../../assets/Robo_feliz_centralizado.png')} />
                            <TouchableOpacity onPress={onPressHandler}><Text style={styles.register}>Clique aqui para se registrar</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b1016',
        alignItems: 'center',
        justifyContent: 'center',
    },
    register: {
        color: 'white',
        marginLeft: 50,
        marginTop: 10,
        fontSize: 17,
    },
    button: {
        marginLeft: 50,
        alignItems: 'center',
        marginTop: 30,
        width: 170,
        backgroundColor: "#7977FD",
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 15,
        color: '#fff',
    },
    input: {
        borderColor: "#7977FD",
        backgroundColor: "#141f29",
        borderRadius: 10,
        height: 50,
        color: '#fff',
        width: 300,
        margin: 12,
        borderWidth: 1.5,
        padding: 10,
        fontSize: 20
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        flexDirection: 'row',
    },
    tinyLogo: {
        width: 70,
        height: 70,
    },
    title: {
        marginLeft: 10,
        marginTop: 3,
        fontSize: 50,
        fontWeight: 'bold',
        color: "#7977FD"
    },
    box: {
        backgroundColor: "#141f29",
        borderRadius: 25,
        height: 710,
        width: 370,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    shade: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 25,
        height: 713,
        width: 373,
    },
    image: {
        height: 250,
        width: 150,
        left: 80,
    }
})
