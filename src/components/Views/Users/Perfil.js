import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import HeaderUser from '../../HeaderUser';
import OpButton from '../../Shared/OpButton';
import Icon, { Icons } from '../../Icons';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AText from '../../Shared/AText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import ComingSoonComponent from '../../Shared/ComingSoon';

const TextSize1 = 20; // Tamanho padrão da fonte
const TextSize2 = 26; // Tamanho padrão da fonte

const db = SQLite.openDatabase(
    {
        name: 'Users.db',
        location: 'Documents',
    },
    () => { },
    error => { console.log(error) }
);

export default function Perfil({navigation}) {

    const { colors } = useTheme(); //Variavel de cores do tema

    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const [visibleModal, setVisibleModal] = useState(false)
    const [visibleModal2, setVisibleModal2] = useState(false)
    const [visibleModal3, setVisibleModal3] = useState(false)
    const [visibleComingSoon, setVisibleComingSoon] = useState(false)
    const [Senha, setSenha] = useState(false)
    const [SenhaAtual, setSenhaAtual] = useState(false)
    const [NovaSenha, setNovaSenha] = useState(false)
    const [ConfirmarSenha, setConfirmarSenha] = useState(false)
    const [NewName, setNewName] = useState(false)
    const [UserId, setUserId] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [XP, setXP] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            getUser();
        }, [])
    );

    const getUser = async () => {
        const storageXP = await AsyncStorage.getItem('XP');
        const storageUser = await AsyncStorage.getItem('IdUser');
        const storageName = await AsyncStorage.getItem('Name');
        const storageEmail = await AsyncStorage.getItem('Email');
        const storageSenha = await AsyncStorage.getItem('Senha');
        setUserId(storageUser);
        setXP(storageXP);
        setName(storageName);
        setEmail(storageEmail);
        setSenha(storageSenha);
    }

    const setNamef = async () => {
        await db.transaction(async (tx) => {
            await tx.executeSql(
                "UPDATE Users SET Name=? WHERE ID = ?;",
                [NewName, UserId]
            );
            setName(NewName);
            await AsyncStorage.setItem('Name', NewName);
            setVisibleModal(false);
            setVisibleModal3(true);
        })
    }

    const setPassf = async () => {
        if(Senha == SenhaAtual && NovaSenha == ConfirmarSenha){
            await db.transaction(async (tx) => {
                await tx.executeSql(
                    "UPDATE Users SET Senha=? WHERE ID = ?;",
                    [NovaSenha, UserId]
                );
                setVisibleModal2(false);
                setVisibleModal3(true);
            })
        }else{
            if(Senha != SenhaAtual){
                alert('Senha Atual Incorreta')
            }
            if(NovaSenha != ConfirmarSenha){
                alert('A nova senha inserida não está difente do campo Confirmar')
            }
        }
    }

    const logout = async () => {
        await AsyncStorage.setItem('IdUser', JSON.stringify(0));
        navigation.navigate('Login')
    }
    
    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <HeaderUser title={t("account")} XP={XP}/>
            <View style={[styles.direction, {backgroundColor: colors.background}]}>

                <Icon type={Icons.FontAwesome}
                    name='user-circle'
                    color={colors.border}
                    size={150}
                    style={[styles.account, { backgroundColor: colors.notification }]} />
                <View style={styles.components}>
                    <AText style={[styles.text, {color: colors.text}]} defaultSize={TextSize1}>{t("name")}</AText>
                    <Text style={styles.text2}
                        adjustsFontSizeToFit={true}
                        numberOfLines={2}
                    >{name}</Text>
                    <AText style={[styles.text, {color: colors.text}]} defaultSize={TextSize1}>{t("email")}</AText>
                    <Text style={styles.text2}
                        adjustsFontSizeToFit={true}
                        numberOfLines={3}
                    >{email}</Text>
                </View>
            </View>
            <ScrollView style={styles.scroller} showsVerticalScrollIndicator={false}>
                <OpButton theme='primaryButton' title={t("edit account")} onPressFunction={() => setVisibleModal(true)} />
                <OpButton theme='primaryButton' title={t("change password")} onPressFunction={() => setVisibleModal2(true)} />
                {/* <OpButton theme='primaryButton' title={t("change picture")} onPressFunction={() => console.log("foto")} /> */}
                <OpButton theme='primaryButton' title={t("achievements")} onPressFunction={() => setVisibleComingSoon(!visibleComingSoon)} />
                <OpButton theme='primaryButton' title={t("exit")} onPressFunction={logout}
                    iconType='MaterialCommunityIcons' iconName={"logout"} iconColor={colors.text} iconSize={25} />
            </ScrollView>
            <ComingSoonComponent
                visible={visibleComingSoon}
                onDismiss={() => setVisibleComingSoon(!visibleComingSoon)}
            />
            <Modal
                visible={visibleModal}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={[styles.contant, {backgroundColor: colors.background}]}>
                        <AText style={[styles.textModal2, {color: colors.text}]} defaultSize={TextSize2}>{t("edit account")}</AText>
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
                        <AText style={[styles.textModal, {color: colors.text}]} defaultSize={TextSize1}>{t("new name")}:</AText>
                        <TextInput style={styles.input}
                        onChangeText={(value) => setNewName(value)}
                        ></TextInput>
                        <OpButton theme={"modalButtonUser"} title={t("change")} onPressFunction={() => setNamef()} />
                    </View>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={visibleModal2}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={[styles.contant, {backgroundColor: colors.background}]}>
                        <AText style={[styles.textModal2, {color: colors.text}]} defaultSize={TextSize2}>{t("change password")}</AText>
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
                        <AText style={[styles.textModal, {color: colors.text}]} defaultSize={TextSize1}>{t("current password")}:</AText>
                        <TextInput style={styles.input}
                        onChangeText={(value) => setSenhaAtual(JSON.stringify(value))}
                        ></TextInput>
                        <AText style={[styles.textModal, {color: colors.text}]} defaultSize={TextSize1}>{t("new password")}:</AText>
                        <TextInput style={styles.input}
                        onChangeText={(value) => setNovaSenha(value)}
                        ></TextInput>
                        <AText style={[styles.textModal, {color: colors.text}]} defaultSize={TextSize1}>{t("confirm password")}:</AText>
                        <TextInput style={styles.input}
                        onChangeText={(value) => setConfirmarSenha(value)}
                        ></TextInput>
                        <OpButton theme={"modalButtonUser"} title={t("change")} onPressFunction={() => setPassf()} />
                    </View>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={visibleModal3}
                transparent={true}
            >
                <SafeAreaView>
                    <View style={[styles.contant, {backgroundColor: colors.background}]}>
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
                        <AText style={[styles.textModal, {color: colors.text}]} defaultSize={TextSize1}>{t("successfully changed")}</AText>
                        <OpButton theme={"modalButtonUser"} title={t("close")} onPressFunction={() => setVisibleModal3(false)} />
                    </View>
                </SafeAreaView>
            </Modal>
        </View>

    )
}

const styles = StyleSheet.create({

    container: {
        backgroundColor: '#141f29',
        height: "100%",
    },
    scroller: {
        width: '90%',
        marginLeft: '5%',
        marginBottom: '18%',
    },
    direction: {
        flexDirection: "row",
        alignItems: "center",
        height: "30%",
        marginBottom: 15,
        backgroundColor: '#141f29',
        borderTopWidth: 2,
        borderTopColor: 'rgba(0,0,0, 0.2)',
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 7,
    },
    account: {
        left: "5%",
        borderRadius: 75,
        backgroundColor: "#33526E",
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 20,
    },
    components: {
        flexDirection: "column",
        width: "48%",
        marginLeft: '10%',
    },
    text: {
        color: "#E5E5E5",
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    text2: {
        color: "#5469D3",
        fontWeight: 'bold',
        fontSize: 19,
        marginBottom: 20,
    },
    textModal: {
        flexGrow: 1,
        margin: 10,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 20,
        fontWeight: "bold",
    },
    textModal2: {
        position: 'absolute',
        left: 10,
        margin: 10,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 26,
        fontWeight: "bold",
    },
    input: {
        opacity: 0.93,
        backgroundColor: "#5469D3",
        borderRadius: 10,
        height: 40,
        color: '#fff',
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
    },
    contant: {
        opacity: 0.99,
        margin: 20,
        marginTop: -100,
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
    icon: {
        marginLeft: 260,
        top: -15,
    },
})

