import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import DefaultHeader from '../components/DefaultHeader';
import OpButton from '../Helpers/OpButton';
import Icon, { Icons } from '../components/Icons';

const db = SQLite.openDatabase(
    {
        name: 'MainDB',
        location: 'Documents',
    },
    () => { },
    error => { console.log(error) }
);

export default function Perfil() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT Name, Email FROM Users",
                    [],
                    (tx, results) => {
                        var len = results.rows.length;
                        if (len > 0) {
                            var userName = results.rows.item(0).Name;
                            var userEmail = results.rows.item(0).Email;
                            setName(userName);
                            setEmail(userEmail);
                        }
                    }
                )
            })
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={styles.container}>
            <DefaultHeader title='      Perfil' />
            <View style={styles.direction}>

                <Icon type={Icons.FontAwesome}
                    name='user-circle'
                    color={"#233648"}
                    size={150}
                    style={styles.account} />
                <View style={styles.components}>
                    <Text style={styles.text}>Nome: </Text>
                    <Text style={styles.text2}
                        adjustsFontSizeToFit={true}
                        numberOfLines={3}
                    >{name}</Text>
                    <Text style={styles.text}>Email: </Text>
                    <Text style={styles.text2}
                        adjustsFontSizeToFit={true}
                        numberOfLines={3}
                    >{email}</Text>
                </View>
            </View>
            <ScrollView style={styles.scroller} showsVerticalScrollIndicator={false}>
                <OpButton theme='primaryButton' title='Editar perfil' onPressFunction={() => console.log("perfil")} />
                <OpButton theme='primaryButton' title='Alterar senha' onPressFunction={() => console.log("senha")} />
                <OpButton theme='primaryButton' title='Alterar foto' onPressFunction={() => console.log("foto")} />
                <OpButton theme='primaryButton' title='Conquistas' onPressFunction={() => console.log("conquista")} />
                <OpButton theme='primaryButton' title='Sair' onPressFunction={() => console.log("sair")}
                    iconType='MaterialCommunityIcons' iconName={"logout"} iconColor={"white"} iconSize={25} />
            </ScrollView>
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
        marginTop: 20,
    },
    text2: {
        color: "#5469D3",
        fontSize: 19,
        marginBottom: 20,
    },
})

