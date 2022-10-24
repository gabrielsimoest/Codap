import React, { useState, useEffect,} from 'react';
import { Text, View, TouchableOpacity, Modal, SafeAreaView, StyleSheet } from 'react-native';
import Icon, { Icons } from '../components/Icons';
import OpButton from './OpButton';

export default function CongratsView({ navigation, progresso}) {
    const [number, setNumber] = React.useState(1);
    const [talk, setTalk] = useState('');

    useEffect(() => {
        const randomNumber = Math.floor(Math.random() * 3) + 1;
        setNumber(randomNumber);

        if(number == 1){
            setTalk('Parábens, Você foi feito para isso!')
        }
        if(number == 2){
            setTalk('Continue Assim!') 
        }
        if(number == 3){
            setTalk('Você foi incrivel!') 
        }
    }, [])

    return (
        <View style={styles.container}>
            <View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
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
                    <Text style={styles.text}>{talk}</Text>
                </View>
            </View>
            <OpButton theme={"nextButton"} title="Voltar à Tela Inicial" onPressFunction={() => navigation.navigate("Home")} />
            
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
        top:-2,
        height: 8,
        width: '100%',
        backgroundColor: 'white',
      },

})
