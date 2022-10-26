import React from 'react';
import {StyleSheet} from 'react-native';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';
import TextView from '../../../Helpers/TextView';

export function BasicPrat1_html({ navigation }) {
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Como é feito o Titulo de uma pagina?"
            opt1="<h1> Esse é um título <h1>"
            opt2="<Title> Esse é um título <Title>"
            opt3="<h6> Esse é um título <h6>"
            opt4="<header> Esse é um título <header>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BasicPrat2_html"
        />
    )
}

export function BasicPrat2_html({ navigation }) {
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="35%"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Paragrafos são geralmente utilizados para separar textos" //Opcional
            //PERGUNTA
            pergunta="Qual desses textos está em um paragrafo?"
            opt1="<Paragrafo> Esse é um parágrafo <parágrafo>"
            opt2="<Title> Esse é um parágrafo <Title>"
            opt3="<p> Esse é um parágrafo <p>"
            opt4="<header> Esse é um parágrafo <header>"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BasicPrat3_html"
        />
    )
}
export function BasicPrat3_html({ navigation }) {
    return (
        <SelectView
            navigation={navigation}
            progresso="70%"
            adicionaltxt="none" //Opcional
            pergunta="Codifique um titulo escrito Codap é Legal"
            opt1="<h1>"
            opt2="Texto"
            opt3="Codap é Legal"    
            opt4="</h1>"
            opt5="<titulo>" //Opcional
            opt6="</titulo>" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto="<h1>Codap é Legal</h1>"
            navegar="BasicPrat4_html"
        />
        )
}

export function BasicPrat4_html({ navigation }) {
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Botões geralmente são usados para executar ações dentro dos sites" //Opcional
            //PERGUNTA
            pergunta="Codifique um Botão escrito CODAP"
            txtantes="<button>"
            txtdepois="</button>"
            txtCerto1="CODAP"
            txtCerto2="codap"
            txtCerto3="Codap"
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
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
        color: 'white',
        fontSize: 23,
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
    }

})