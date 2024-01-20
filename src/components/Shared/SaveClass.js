import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
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

export default function SaveClass({ AulaId, Salvar }) {
    useFocusEffect(
        React.useCallback(() => {
            //console.log(AulaId + "/" + Salvar) ;

            if (Salvar == true) {
                getUser();
            }
        }, [])
    );

    const getUser = async () => {
        if (AulaId != null) {
            const storageUser = await AsyncStorage.getItem('IdUser');

            await db.transaction(async (tx) => {
                tx.executeSql(
                    "SELECT TipoAula FROM Aulas WHERE UserID = ? AND TipoAula = ?",
                    [storageUser, AulaId],
                    async (tx, results) => {
                        const rows = results.rows;
                        if (rows.length === 0) {
                            // Se não existir, então inserir
                            await tx.executeSql(
                                "INSERT INTO Aulas (UserID, TipoAula) VALUES (?, ?)",
                                [storageUser, AulaId]
                            );
                        }
                    },
                    (tx, error) => {
                        console.log('Error checking TipoAula:', error);
                    }
                );

                db.transaction(async (tx2) => {
                    await tx2.executeSql(
                        "SELECT TipoAula FROM Aulas WHERE UserID = ?",
                        [storageUser],
                        async (tx2, results2) => {
                            const rows = results2.rows;
                            const aulaTypes = [];

                            for (let i = 0; i < rows.length; i++) {
                                aulaTypes.push(rows.item(i).TipoAula);
                            }

                            const aulasString = aulaTypes.length > 0 ? aulaTypes.join(', ') : '';

                            // console.log(aulasString)
                            await AsyncStorage.setItem('Aulas', aulasString);
                        },
                        (tx, error) => {
                            console.log('Error fetching Aulas:', error);
                        }
                    );
                });
            })
        }
    };

    return (
        <View />
    )
}
