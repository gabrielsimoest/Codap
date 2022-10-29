import React, { useEffect, useReducer, useState } from 'react';
import { View, StyleSheet, Text, Image, Modal, SafeAreaView, TouchableOpacity } from 'react-native';
import HeaderShop from '../components/HeaderShop';
import OpButton from '../Helpers/OpButton';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Iconis from 'react-native-vector-icons/Octicons';
import Icon, { Icons } from '../components/Icons';
import SQLite from 'react-native-sqlite-storage';
import { useTheme } from "@react-navigation/native"
import AText from '../Helpers/AText';
import { useTranslation } from 'react-i18next';

const headerTextSize = 25;
const textSize = 20;

const db = SQLite.openDatabase(
    {
        name: 'Users.db',
        location: 'default',
    },
    () => { },
    error => { console.log(error) }
);

export default function Store() {

    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const {colors} = useTheme(); //Variavel de cor do tema

    const [reducerValue, forceUpdate] = useReducer(x => x + 1, 0);
    const [visibleModal, setVisibleModal] = useState(false)
    const [visibleModal2, setVisibleModal2] = useState(false)
    const [visibleModal3, setVisibleModal3] = useState(false)
    const [visibleModal4, setVisibleModal4] = useState(false)
    const [visibleModal5, setVisibleModal5] = useState(false)
    const [UserId, setUserId] = useState('');
    const [Dependa, setDependa] = useState('');
    const [XP, setXP] = useState('');
    const [Double, setDouble] = useState('');
    const [XpDoubleBool, setXpDoubleBool] = useState('0');
    const [XpAtivo, setXpAtivo] = useState('Inativo');

    useFocusEffect(
        React.useCallback(() => {
            getUser();
        }, [reducerValue])
    );
    useEffect(() => {
        if (XpDoubleBool == '0' || XpDoubleBool == null)
            setXpAtivo('Inativo');
        if (XpDoubleBool == '1')
            setXpAtivo('Ativo');
    });

    const getUser = async () => {
        const storageDependa = await AsyncStorage.getItem('DependaBots');
        const storageXP = await AsyncStorage.getItem('XP');
        const storageUser = await AsyncStorage.getItem('IdUser');
        const storageDouble = await AsyncStorage.getItem('Double');
        const storageXPDouble = await AsyncStorage.getItem('XPDouble');
        setXP(storageXP);
        setUserId(storageUser)
        setDouble(parseInt(storageDouble) + 1);
        setDependa(storageDependa);
        setXpDoubleBool(storageXPDouble);
    }



    var DoubleCoins = Dependa

    async function DoubleF() {
        await db.transaction(async (tx) => {
            await tx.executeSql(
                "UPDATE Users SET Double=?, DependaBots=? WHERE ID = ?;",
                [Double, DoubleCoins, UserId]
            );
            await AsyncStorage.setItem('Double', JSON.stringify(Double));
            await AsyncStorage.setItem('DependaBots', JSON.stringify(DoubleCoins));
            forceUpdate()
        })
    }
    async function DoubleX() {
        await db.transaction(async (tx) => {
            await tx.executeSql(
                "UPDATE Users SET DependaBots=? WHERE ID = ?;",
                [DoubleCoins, UserId]
            );
            await AsyncStorage.setItem('XPDouble', '1');
            await AsyncStorage.setItem('DependaBots', JSON.stringify(DoubleCoins));
            setXpAtivo('Ativo')
            setTimeout(forceUpdate, 2000);
            setTimeout(async function () {
                await AsyncStorage.setItem('XPDouble', '0');
                alert("Desativado");
                setXpAtivo('Inativo')
                setTimeout(forceUpdate, 2000);
            }, 300000);
        })
    }

    const sendXP = async () => {
        if (Dependa > 200) {
            DoubleCoins = DoubleCoins - 200
            DoubleX()
        }
        else {
            alert("DependaBots Insuficientes");
        }
    }

    const sendChest = async () => {
        if (Dependa > 500) {
            DoubleCoins = DoubleCoins - 500
            await db.transaction(async (tx) => {
                await tx.executeSql(
                    "UPDATE Users SET DependaBots=? WHERE ID = ?;",
                    [DoubleCoins, UserId]
                );
                await AsyncStorage.setItem('DependaBots', JSON.stringify(DoubleCoins));

                var randomNumber = Math.floor(Math.random() * 2) + 1;

                if (randomNumber == 1) {
                    setVisibleModal2(false);
                    setVisibleModal5(true);
                    DoubleF()
                }
                if (randomNumber == 2) {
                    setVisibleModal2(false);
                    setVisibleModal4(true);
                    DoubleX();
                }

                forceUpdate()
            })
        }
        else {
            alert("DependaBots Insuficientes");
        }
    }

    const sendDouble = async () => {
        if (Dependa > 300) {
            DoubleCoins = DoubleCoins - 300
            DoubleF();
        }
        else {
            alert("DependaBots Insuficientes");
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <HeaderShop dependa={Dependa} />
            <Text style={[styles.headert, { color: colors.text }]}>{t("buy using dependabots")}</Text>
            <View style={[styles.list, { backgroundColor: colors.primary }]}>
                <Text style={[styles.Double, { color: colors.text }]}>{XpAtivo}</Text>
                <Image style={styles.tinyLogo} source={require('../../assets/potion.png')} />
                <Text style={[styles.textL, { color: colors.text }]}>{t("double experience")}</Text>
                <Text style={[styles.textLD, { color: colors.text }]}>200 <Iconis name="dependabot" size={21} color={colors.text} /></Text>
                <View style={styles.button}>
                    <OpButton theme={"marketButton"} title="COMPRAR" onPressFunction={() => setVisibleModal(true)} />
                </View>
            </View>
            <View style={[styles.list, { backgroundColor: colors.primary }]}>
                <Text style={[styles.textL2, { color: colors.text }]}>{t("surprise chest")}</Text>
                <Text style={[styles.textLD2, { color: colors.text }]}><Iconis name="dependabot" size={21} color={colors.text} /> 500</Text>
                <Image style={styles.tinyLogo2} source={require('../../assets/CaixaSurpresa.png')} />
                <OpButton theme={"marketButton2"} title="COMPRAR" onPressFunction={() => setVisibleModal2(true)} />
            </View>
            <View style={[styles.list, { backgroundColor: colors.primary }]}>
                <Text style={[styles.Double, { color: colors.text }]}>{Double - 1}</Text>
                <Image style={styles.tinyLogo3} source={require('../../assets/Time.png')} />
                <Text style={[styles.textL, { color: colors.text }]}>{t("double time")}</Text>
                <Text style={[styles.textLD3, { color: colors.text }]}>300 <Iconis name="dependabot" size={21} color={colors.text} /></Text>
                <View style={styles.button}>
                    <OpButton theme={"marketButton"} title={t("buy")} onPressFunction={() => setVisibleModal3(true)} />
                </View>
            </View>

            <Modal
                visible={visibleModal}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={styles.contant}>
                        <TouchableOpacity
                            onPress={() => setVisibleModal(false)}
                        >
                            <Icon
                                type={Icons.Ionicons}
                                name="ios-close-outline"
                                color={"#33526E"}
                                size={60}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <Text style={styles.textModal}>Você deseja realmente comprar o Dobro de Experiência por 5 Minutos?</Text>
                        <Image style={styles.tinyModalLogo} source={require('../../assets/potion.png')} />
                        <Text style={[styles.text, { color: colors.text }]}>200 <Iconis name="dependabot" size={30} color={colors.text} /></Text>
                        <OpButton theme={"modalButtonStore"} title="Comprar" onPressFunction={() => sendXP()} />
                    </View>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={visibleModal2}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={styles.contant}>
                        <TouchableOpacity
                            onPress={() => setVisibleModal2(false)}
                        >
                            <Icon
                                type={Icons.Ionicons}
                                name="ios-close-outline"
                                color={"#33526E"}
                                size={60}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <Text style={styles.textModal}>Você deseja realmente comprar o Baú Supresa?</Text>
                        <Image style={styles.tinyModalLogo2} source={require('../../assets/CaixaSurpresa.png')} />
                        <Text style={[styles.text, { color: colors.text }]}>500 <Iconis name="dependabot" size={30} color={colors.text} /></Text>
                        <OpButton theme={"modalButtonStore"} title="Comprar" onPressFunction={() => sendChest()} />
                    </View>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={visibleModal3}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={styles.contant}>
                        <TouchableOpacity
                            onPress={() => setVisibleModal3(false)}
                        >
                            <Icon
                                type={Icons.Ionicons}
                                name="ios-close-outline"
                                color={"#33526E"}
                                size={60}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <Text style={styles.textModal}>Você deseja realmente comprar o Dobro de Tempo para sua proxima aula?</Text>
                        <Image style={styles.tinyModalLogo3} source={require('../../assets/Time.png')} />
                        <Text style={[styles.text, { color: colors.text }]}>300 <Iconis name="dependabot" size={30} color={colors.text} /></Text>
                        <OpButton theme={"modalButtonStore"} title="Comprar" onPressFunction={() => sendDouble()} />
                    </View>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={visibleModal4}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={styles.contant}>
                        <TouchableOpacity
                            onPress={() => setVisibleModal4(false)}
                        >
                            <Icon
                                type={Icons.Ionicons}
                                name="ios-close-outline"
                                color={"#33526E"}
                                size={60}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <Text style={styles.textModal}>Você ganhou o Dobro de XP por 5 Minutos!</Text>
                        <Image style={styles.tinyModalLogo} source={require('../../assets/potion.png')} />
                        <OpButton theme={"modalButtonStore"} title="Fechar" onPressFunction={() => setVisibleModal4(false)} />
                    </View>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={visibleModal5}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={styles.contant}>
                        <TouchableOpacity
                            onPress={() => setVisibleModal5(false)}
                        >
                            <Icon
                                type={Icons.Ionicons}
                                name="ios-close-outline"
                                color={"#33526E"}
                                size={60}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <Text style={styles.textModal}>Você ganhou o Dobro de Tempo para a Proxima aula!</Text>
                        <Image style={styles.tinyModalLogo3} source={require('../../assets/Time.png')} />
                        <OpButton theme={"modalButtonStore"} title="Fechar" onPressFunction={() => setVisibleModal5(false)} />
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#141f29',
        height: 1000
    },
    headert: {
        margin: 10,
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        textAlign: 'center'
    },
    list: {
        backgroundColor: '#1B2B39',
        borderRadius: 10,
        height: 170,
        margin: 10,
        elevation: 7
    },
    tinyLogo: {
        margin: 10,
        width: 108,
        height: 153,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 20,
    },
    tinyLogo2: {
        position: 'absolute',
        right: 20,
        top: 20,
        width: 120,
        height: 133,
    },
    tinyLogo3: {
        margin: 10,
        width: 120,
        height: 137,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 20,
    },
    textL: {
        color: '#fff',
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        right: 40,
        top: 10,
    },
    textL2: {
        color: '#fff',
        fontWeight: 'bold',
        position: 'absolute',
        fontFamily: 'Roboto',
        fontSize: 20,
        left: 35,
        top: 10
    },
    textL3: {
        color: '#fff',
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        right: 60,
        top: 38
    },
    textLD: {
        color: '#637aff',
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        right: 40,
        top: 38
    },
    textLD2: {
        color: '#637aff',
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        left: 35,
        top: 38
    },
    textLD3: {
        color: '#637aff',
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        right: 40,
        top: 38
    },
    contant: {
        opacity: 0.93,
        margin: 20,
        marginTop: 130,
        zIndex: 99,
        padding: 20,
        borderRadius: 30,
        borderColor: 'rgba(0,0,0, 0.2)',
        backgroundColor: '#141f29',

        shadowColor: 'rgba(0,0,0, 0.3)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 5,
        shadowOpacity: 0.28,
        shadowRadius: 4,
    },
    textModal: {
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
        fontWeight: "bold",
        marginTop: -40
    },
    tinyModalLogo: {
        margin: 10,
        width: 108,
        height: 153,
        marginLeft: '28%',
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 20,
    },
    tinyModalLogo2: {
        width: 120,
        height: 133,
        margin: 10,
        marginLeft: '28%',
    },
    tinyModalLogo3: {
        margin: 10,
        marginLeft: '28%',
        width: 120,
        height: 137,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 20,
    },
    icon: {
        marginLeft: 260,
        top: -15,
    },
    text: {
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 30,
        fontWeight: "bold",
        marginLeft: '35%',
    },
    Double: {
        position: 'absolute',
        top: 5,
        left: 7
    },
})