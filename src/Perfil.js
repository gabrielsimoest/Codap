import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

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
                            var userName = results.rows.item(1).Name;
                            var userEmail = results.rows.item(1).Email;
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
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.body}>
            <View style={styles.header}>
                <View style={styles.placeholder} />
                <View style={styles.headerLabels}>
                    <Text style={styles.textName}>Nome: </Text>
                    <Text style={styles.name}>{name} </Text>
                    <Text style={styles.textEmail}>Email: </Text>
                    <Text style={styles.email}>{email} </Text>
                </View>
            </View>
            <View style={styles.buttonOptions}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Alterar senha  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Editar perfil  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Conquistas  </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({

    body: {
        flex: 1,
        flexDirection: "column"
    },
    header: {
        backgroundColor: "#343434",
        borderBottomStartRadius: 20,
        borderBottomEndRadius: 20,
        flexDirection: "row",
        flex: 1,
        width: "96%",
        maxHeight: "35%",
        left: "1%",
    },
    headerLabels: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignContent: "center"
    },
    textEmail: {
        color: "#9D9D9D",
        fontSize: 19,
        flex: 1,
        left: "10%",
        top: "5%",
    },
    email: {
        color: "#ADADAD",
        flex: 1,
        fontSize: 20,
        left: "10%",
        bottom: "5%",
    },
    textName: {
        color: "#9D9D9D",
        fontSize: 20,
        flex: 1,
        top: "15%",
        left: "10%",
    },
    name: {
        color: "#ADADAD",
        flex: 1,
        fontSize: 19,
        left: "10%",
        top: "5%",
    },
    buttonOptions: {
        backgroundColor: "#343434",
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
        flex: 2,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "96%",
        maxHeight: "55%",
        left: "2%",
        top: "1%",
        bottom: "10%"
    },
    button: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
        flex: -1,
        borderColor: "#9D9D9D",
        borderWidth: 1,
        borderRadius: 10,
        width: "90%",
        height: "25%",

    },
    buttonText: {
        flex: -1,
        color: "#ADADAD",
        fontSize: 22,
    },
    placeholder: {
        backgroundColor: "gray",
        flex: -1,
        width: 150,
        height: 150,
        borderRadius: 75,
        top: "7%",
        left: "5%",

    }
})

