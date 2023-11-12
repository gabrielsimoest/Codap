import { useTheme } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import SQLite from 'react-native-sqlite-storage';
import { AppContext } from '../../../common/Contexts/AppContext';
import { CustomDarkMode } from '../../../common/Themes/DefaultThemes';
import AText from '../../Shared/AText';
import CustomAlert from '../../Shared/CustomAlert';
import CustomButton from '../../Shared/CustomButton';
const validator = require('validator');

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
    const { t, i18n } = useTranslation();

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [name, setName] = useState('');
    const [senha, setSenha] = useState('');
    const [email, setEmail] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        createTable();
    }, []);

    const deleteDB = () => {
        SQLite.deleteDatabase(
            { name: 'Users.db', location: 'default' },
            () => { console.log('Users db deleted'); },
            error => {
                console.log("ERROR: " + error);
            }
        );
    }

    const createTable = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS "
                + "Users "
                + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Senha Text, Email TEXT, DependaBots INT, XP LONG,Double INT,Aulas TEXT);"
            )
        })
    }

    const setData = async () => {
        if (name.length == 0 || senha.length == 0 || email.length == 0) {
            setAlertTitle(t("register.alert.empty.title"));
            setAlertMessage(t("register.alert.empty.message"));
            setAlertVisible(true);
        } else if (validator.isEmail(email) == false) {
            setAlertTitle(t("register.alert.invalid.title"));
            setAlertMessage(t("register.alert.invalid.message"));
            setAlertVisible(true);
        }
        else {
            try {
                await db.transaction(async (tx) => {
                    await tx.executeSql(
                        "INSERT INTO Users (Name, Senha, Email, DependaBots, XP, Double, Aulas) VALUES (?,?,?,?,?,?,?)",
                        [name, senha, email, 0, 0, 0, 'aulas:']
                    );
                })
                setAlertTitle(t("register.alert.success.title"));
                setAlertMessage(t("register.alert.success.message"));
                setAlertVisible(true);
                navigation.navigate('Login');
            } catch (error) {
                console.log(error);
            }
        }
    }

    const onChangePassword = (value) => {
        setPassword(value);
    }

    const onChangeConfirmPassword = (value) => {
        setConfirmPassword(value);
        if (value != password) {
            setPasswordMatch(false)
        } else {
            setPasswordMatch(true)
            setSenha(value)
        }
    }

    const register = () => {
        if (!passwordMatch) {
            setAlertTitle(t("register.alert.not match.title"));
            setAlertMessage(t("register.alert.not match.message"));
            setAlertVisible(true);
        } else {
            setData()
        }
    }

    const onPressHandler = () => {
        navigation.navigate('Login')
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
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder={t("register.name")}
                                placeholderTextColor={"#7977FD"}
                                onChangeText={(value) => setName(value)}
                            />
                            <TextInput
                                autoCapitalize='none'
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder="Email"
                                placeholderTextColor={"#7977FD"}
                                onChangeText={(value) => setEmail(value)}
                            />
                            {/* <AText defaultSize={20} style={styles.text}>Senha</AText> */}
                            <TextInput
                                autoCapitalize='none'
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder={t("register.password")}
                                placeholderTextColor={"#7977FD"}
                                onChangeText={(value) => onChangePassword(value)}
                                secureTextEntry={true}
                            />
                            <AText defaultSize={20} style={[styles.text, { color: passwordMatch ? colors.text : "red" }]}>{t("register.confirm password")}</AText>
                            <TextInput
                                autoCapitalize='none'
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.background, borderColor: passwordMatch ? "#7977FD" : "red",
                                        color: passwordMatch ? colors.text : "red"
                                    }
                                ]}
                                placeholder={passwordMatch ? t("register.password") : t("register.invalid password")}
                                placeholderTextColor={passwordMatch ? "#7977FD" : "red"}
                                onChangeText={(value) => onChangeConfirmPassword(value)}
                                secureTextEntry={true}
                                value={confirmPassword}
                            />
                            <CustomButton
                                title={t("register.register")}
                                color="#7977FD"
                                onPressFunction={register}
                            />
                            {/* <Image style={styles.image} source={require('../../assets/Robo_feliz_centralizado.png')} /> */}
                            <TouchableOpacity onPress={onPressHandler} style={{ alignItems: "center" }}>
                                <Text style={[styles.register, { color: colors.text }]}>{t("register.login")}</Text>
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
        marginTop: 30,
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
    inputError: {
        borderColor: "red",
        backgroundColor: "#141f29",
        borderRadius: 10,
        height: 50,
        color: 'red',
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
    },
    text: {
        color: "white",
        left: "4%",
    },
})
