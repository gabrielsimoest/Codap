import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Keyboard
} from 'react-native';
import CustomButton from '../../Shared/CustomButton';
import SQLite from 'react-native-sqlite-storage';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useContext } from 'react';
import { AppContext } from '../../../common/Contexts/AppContext';
import { CustomDarkMode } from '../../../common/Themes/DefaultThemes';
import { useTheme } from '@react-navigation/native';
import CustomAlert from '../../Shared/CustomAlert';

const db = SQLite.openDatabase(
    {
        name: 'Users.db',
        location: 'default',
    },
    () => { },
    error => { console.log(error) }
);

export default function Login({ navigation }) {

    const { theme } = useContext(AppContext);
    const { colors } = useTheme(); //Variavel de cor do tema

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [senha, setSenha] = useState('');
    const [email, setEmail] = useState('');

    const getUserFromStorage = async () => {
        try {
            const IdUserOnStorage = await AsyncStorage.getItem('IdUser');

            if (IdUserOnStorage != 0)
                navigation.navigate('Home', { screen: 'Aulas' });

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getUserFromStorage();
        createTable();
    }, []);

    const createTable = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS "
                + "Users "
                + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Senha Text, Email TEXT, DependaBots INT , XP LONG,Double INT, Aulas TEXT);"
            )
        })
    }

    const getData = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT Senha, Email FROM Users",
                    [],
                    (tx, results) => {
                        var len = results.rows.length;
                        if (len > 0) {

                        }
                    }
                )
            })
        } catch (error) {
            console.log(error);
        }
    }

    const setData = async () => {
        if (email.length == 0 || senha.length == 0) {
            //Alert.alert('Alerta!', 'Por favor preencha todos os campos.')
            setAlertTitle("Campos não preenchidos!")
            setAlertMessage("Por favor, preencha todos os campos para prosseguir.")
            setAlertVisible(true)
        } else {
            try {
                await db.transaction(async (tx) => {
                    await tx.executeSql(
                        "SELECT ID, Senha, DependaBots, XP, Double, Aulas, Email, Name FROM Users WHERE Senha=? and Email=?",
                        [senha, email],
                        async (tx, results) => {
                            var len = results.rows.length;
                            if (len > 0) {
                                await AsyncStorage.setItem('IdUser', JSON.stringify(results.rows.item(0).ID));
                                await AsyncStorage.setItem('Email', results.rows.item(0).Email);
                                await AsyncStorage.setItem('Name', results.rows.item(0).Name);
                                await AsyncStorage.setItem('Senha', JSON.stringify(results.rows.item(0).Senha));
                                await AsyncStorage.setItem('DependaBots', JSON.stringify(results.rows.item(0).DependaBots));
                                await AsyncStorage.setItem('Double', JSON.stringify(results.rows.item(0).Double));
                                await AsyncStorage.setItem('XP', JSON.stringify(results.rows.item(0).XP));
                                await AsyncStorage.setItem('Aulas', results.rows.item(0).Aulas);
                                await AsyncStorage.setItem('XPDouble', '0');
                                navigation.navigate('Home', { screen: 'Aulas' });
                            } else {
                                //Alert.alert('Alerta!', 'Senha ou Email incorretos')
                                setAlertTitle("Dados inválidos!")
                                setAlertMessage("Senha ou Email incorretos, verifique os dados navamente.")
                                setAlertVisible(true)
                            }
                        }
                    )
                })
            } catch (error) {
                console.log(error);
            }
        }
    }

    const onPressHandler = () => {
        navigation.navigate('Register')
    }

    return (
        <View style={[styles.container, { backgroundColor: theme == CustomDarkMode ? '#0b1016' : '#b2b1b1' }]}>
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss} accessible={false}
            >
                <View style={styles.shade}>
                    <View style={[styles.box, , { backgroundColor: theme == CustomDarkMode ? "#141f29" : '#f2f2f2' }]}>
                        <View style={styles.header}>
                            <Image style={styles.tinyLogo} source={require('../../../../assets/code.png')} />
                            <Text style={styles.title}>Codap</Text>
                        </View>
                        <View>
                            <TextInput
                                autoCapitalize='none'
                                style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                                placeholder="Email"
                                placeholderTextColor={"#7977FD"}
                                onChangeText={(value) => setEmail(value)}
                                value={email}
                            />
                            <TextInput
                                autoCapitalize='none'
                                style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                                placeholder="Senha"
                                placeholderTextColor={"#7977FD"}
                                onChangeText={(value) => setSenha(value)}
                                secureTextEntry={true}
                                value={senha}
                            />
                            <CustomButton
                                title='Login'
                                color="#7977FD"
                                onPressFunction={setData}
                            />
                            <Image style={styles.image} source={require('../../../../assets/Robo_feliz_centralizado.png')} />
                            <TouchableOpacity onPress={onPressHandler}>
                                <Text style={[styles.register, { color: colors.text }]}>Clique aqui para se registrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <CustomAlert
                    visible={alertVisible}
                    onDismiss={() => setAlertVisible(false)}
                    title={alertTitle}
                    message={alertMessage}
                    buttonText="OK"
                />
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
        textAlign: 'center',
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
