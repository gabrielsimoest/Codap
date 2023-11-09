import { useFocusEffect} from '@react-navigation/native';
import React from 'react';
import { useState } from 'react';   
import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';
import { View } from 'react-native-animatable';

const db = SQLite.openDatabase(
    {
        name: 'Users.db',
        location: 'default',
    },
    () => { },
    error => { console.log(error) }
);

export default function SaveClass({aulaSalvar, Salvar}) {
    const [UserId, setUserId] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            if (Salvar == 'true') {
                getUser();
            }
        }, [])
    );

    const getUser = async () => {
        const storageAulasSalvas = await AsyncStorage.getItem('Aulas');
        const storageUser = await AsyncStorage.getItem('IdUser');
        let AulasSalvas= storageAulasSalvas + aulaSalvar;

        await db.transaction(async (tx) => {
            await tx.executeSql(
                "UPDATE Users SET Aulas=? WHERE ID = ?;",
                [AulasSalvas, storageUser]
            );
            await AsyncStorage.setItem('Aulas', AulasSalvas);
        })
    }

    return (
        <View/>
    )
}
