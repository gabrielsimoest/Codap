import React, { useState, useEffect, useReducer, } from 'react';
import { Text, View, TouchableOpacity, Modal, SafeAreaView, StyleSheet } from 'react-native';
import Icon, { Icons } from '../components/Icons';
import OpButton from './OpButton';
import AsyncStorage from '@react-native-async-storage/async-storage'
import SQLite from 'react-native-sqlite-storage';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AText from './AText';

const textSize = 30;

const db = SQLite.openDatabase(
    {
        name: 'Users.db',
        location: 'default',
    },
    () => { },
    error => { console.log(error) }
);

export default function CongratsView({ navigation, progresso }) {

    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const {colors} = useTheme(); //Cores do tema

    const [talk, setTalk] = useState('');
    const [Dependa, setDependa] = useState('');
    const [UserId, setUserId] = useState('');
    const [XP, setXP] = useState('');
    const [CView, setCoins] = useState(0);
    const [reducerValue, forceUpdate] = useReducer(x => x + 1, 0);
    var Coins = 0

    useFocusEffect(
        React.useCallback(() => {
            var randomNumber = Math.floor(Math.random() * 3) + 1;

            if (randomNumber == 1) {
                setTalk(t("congratulations"))
                Coins = 10
            }
            else if (randomNumber == 2) {
                setTalk(t("keep it up"))
                Coins = 15
            }
            else if (randomNumber == 3) {
                setTalk(t("you were amazing"))
                Coins = 20
            }
            getUser();
        }, [])
    );

    const getUser = async () => {
        setCoins(Coins)
        const storageUser = await AsyncStorage.getItem('IdUser');
        const storageDependa = await AsyncStorage.getItem('DependaBots');
        const storageXP = await AsyncStorage.getItem('XP');
        setXP(parseInt(storageXP) + 20) ;
        setUserId(storageUser);
        setDependa(parseInt(storageDependa) + Coins);
    }

    // const getData = () => {
    //     try {
    //         db.transaction((tx) => {
    //             tx.executeSql(
    //                 "SELECT ID, DependaBots FROM Users WHERE ID = ?",
    //                 [UserId],
    //                 (tx, results) => {
    //                     var len = results.rows.length;
    //                     if (len > 0) {
    //                         var dependaBots = results.rows.item(0).DependaBots;
    //                         setDependa(dependaBots);
    //                     }
    //                 }
    //             )
    //         })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    const setData = async () => {
        await db.transaction(async (tx) => {
            await tx.executeSql(
                "UPDATE Users SET DependaBots=?, XP=? WHERE ID = ?;",
                [Dependa,XP, UserId]
            );
            await AsyncStorage.setItem('DependaBots', JSON.stringify(Dependa));
            await AsyncStorage.setItem('XP', JSON.stringify(XP));
            forceUpdate()
            navigation.navigate('Home');
        })
    }

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <View>
                <TouchableOpacity
                    onPress={() => setData()}
                >
                    <Icon
                        type={Icons.Ionicons}
                        name="ios-close-outline"
                        color={"#33526E"}
                        size={60}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <View>
                    <AText style={[styles.text, {color: colors.text}]} defaultSize={textSize}>{talk}</AText>
                    <AText style={[styles.text, {color: colors.text}]} defaultSize={textSize}>+{CView} DependaBots</AText>
                    <AText style={[styles.text, {color: colors.text}]} defaultSize={textSize}>+20 XP</AText>
                </View>
            </View>
            <OpButton theme={"nextButton"} title={t("back")} onPressFunction={() => setData()} />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#0E151C',
    },
    scroller: {
        marginHorizontal: 5,
        marginVertical: 10,
        height: 630,
        paddingBottom: 500,
    },
    box: {
        marginLeft: "1.5%",
        marginTop: 5,
        backgroundColor: '#141f29',
        borderColor: 'rgba(99, 122, 255, 0.2)',
        height: "92%",
        width: "97%",
    },
    text: {
        margin: 20,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: '#fff',
        fontSize: 30,
        fontWeight: "bold"
    },
    image: {
        margin: 10,
        height: 230,
        width: 310,
    }
    ,
    image2: {
        borderRadius: 10,
        margin: 10,
        height: 35,
        width: 310,
    },
    image3: {
        margin: 10,
        height: 100,
        width: 350,
    },
    image4: {
        margin: 10,
        height: 100,
        width: 350,
    },
    icon: {
        marginRight: 20,
        top: 10,
    },
    contant: {
        marginTop: 600,
        marginBottom: 50,
        marginVertical: 20,
        zIndex: 99,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0, 0.2)',
        backgroundColor: '#0E151C',

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
    textModal: {
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
        fontWeight: "bold"
    },
    Textadd: {
        display: 'none'
    },
    progressBar: {
        top: -2,
        height: 8,
        width: '100%',
        backgroundColor: 'white',
    },

})
