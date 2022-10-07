import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput
} from 'react-native';
import CustomButton from './Helpers/CustomButton';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
    {
        name: 'MainDB',
        location: 'Documents',
    },
    () => { },
    error => { console.log(error) }
);

export default function Home({ navigation }) {

    const [name, setName] = useState('');
    const [senha, setSenha] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT Name, Senha, Email FROM Users",
                    [],
                    (tx, results) => {
                        var len = results.rows.length;
                        if (len > 0) {
                            for(i=0;i<results.rows.length;i++){
                                var userName = results.rows.item(i).Name;
                                var userSenha = results.rows.item(i).Senha;
                                var userEmail = results.rows.item(i).Email;
                                setName(userName);
                                setSenha(userSenha);
                                setEmail(userEmail);
                            }
                        }
                    }
                )
            })
        } catch (error) {
            console.log(error);
        }
    }

    const updateData = async () => {
        if (name.length == 0) {
            Alert.alert('Warning!', 'Please write your data.')
        } else {
            try {
                // var user = {
                //     Name: name
                // }
                // await AsyncStorage.mergeItem('UserData', JSON.stringify(user));
                db.transaction((tx) => {
                    tx.executeSql(
                        "UPDATE Users SET Name=?",
                        [name],
                        () => { Alert.alert('Success!', 'Your data has been updated.') },
                        error => { console.log(error) }
                    )
                })
            } catch (error) {
                console.log(error);
            }
        }
    }

    const removeData = async () => {
        try {
            // await AsyncStorage.clear();
            db.transaction((tx) => {
                tx.executeSql(
                    "DELETE FROM Users",
                    [],
                    () => { navigation.navigate('Login') },
                    error => { console.log(error) }
                )
            })
        } catch (error) {
            console.log(error);
        }
    }

    const onPressHandler = () => {
        navigation.navigate('Login')
    }

    return (
        <View style={styles.body}>
            <Text style={styles.text}>Welcome {name} !</Text>
            <Text style={styles.text}>Senha {senha} !</Text>
            <Text style={styles.text}>Email {email} !</Text>
            <TextInput
                style={styles.input}
                placeholder='Enter your name'
                value={name}
                onChangeText={(value) => setName(value)}
            />
            <CustomButton
                title='Update'
                color='#ff7f00'
                onPressFunction={updateData}
            />
            <CustomButton
                title='Remove'
                color='#f40100'
                onPressFunction={removeData}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 30,
    }
})
