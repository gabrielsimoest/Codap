import React, { useState } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, TouchableOpacity} from 'react-native';
import Icon, { Icons } from '../../../components/Icons';
import OpButton from '../../../Helpers/OpButton';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';

export function BasicPrat1_html({ navigation }) {
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none"
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
            progresso="25%"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Testo teste"
            //PERGUNTA
            pergunta="Teste?"
            opt1="<h1> Esse é um Teste <h1>"
            opt2="<Title> Esse é um Teste <Title>"
            opt3="<h6> Esse é um Teste <h6>"
            opt4="<header> Esse é um Teste <header>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BasicPrat3_html"
        />
    )
}
export function BasicPrat3_html({ navigation }) {
    return (
        <SelectView
            navigation={navigation}
            progresso="50%"
            adicionaltxt="none"
            pergunta="Select?"
            opt1="<h1>"
            opt2="Texto"
            opt3="</h1>"    
            opt4="</h2>"
            opt5="none" //Opcional
            opt6="none" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO CERTO COM UM ESPAÇO SEPARANDO ENTRE AS OPÇÕES
            txtCerto="<h1>Texto</h1>"
            navegar="BasicPrat4_html"
        />
        )
}















export function Basic1_html({ navigation }) {
    return (
        <View style={styles.container}>
            <View>
                <ScrollView  >
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
                    <View style={{ alignItems: 'center', margin: 10, marginBottom: 100 }}>
                        <Text style={styles.text}>
                            Olá, aqui é o NOME, fui instruído por meus criadores a ensinar diversas linguagens de programação diferentes. Vamos aprender sobre HTML?
                            Essa é uma linguagem muito usada para desenvolvimento Web, então é uma linguagem amplamente usada no mercado de trabalho.
                            Antes da nossa primeira aula, este é um exemplo de estrutura HTML:
                        </Text>
                        <Image source={require('../../../../assets/Estrutura.png')} style={styles.image} />
                        <Image source={require('../../../../assets/Estrutura2.png')} style={[styles.image, { height: 260 }]} />
                        <Text style={styles.text}>
                            Esse é um exemplo bem simples, mas com ele você já pode ter uma ideia de como funciona a estrutura. Vamos prosseguir para nossa aula.
                        </Text>
                    </View>
                    <OpButton theme={"nextButton"} title="Voltar" onPressFunction={() => navigation.navigate("Home")} />
                </ScrollView>
            </View>
        </View>
    )
}

export function Basic2_html({ navigation }) {
    return (
        <View style={styles.container}>
            <ScrollView>
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
                <View style={{ alignItems: 'center', margin: 10, marginBottom: 100 }}>
                    <Text style={styles.text}>
                        Como você pôde ver na aula passada, a estrutura é formada por tags de abertura e de fechamento. As tags são formadas por chaves anguladas dessa forma:
                        &#10094;CÓDIGO&#10095;, e são fechadas da mesma forma com uma barra na primeira chave: &#10094;/CÓDIGO&#10095;.
                        Esses são os chamados "Elementos", e o que fica entre as tags é o que chamamos de "Conteúdo".
                    </Text>
                    <Image source={require('../../../../assets/Elemento.png')} style={styles.image2} />
                    <Text style={styles.text}>
                        O conteúdo não se resume apenas a textos, podem ser colocados inclusive outros elementos.
                    </Text>
                    <Text style={styles.text}>Existem mais de 100 elementos com funções diferentes no HTML, mas as mais utilizadas são as seguintes:</Text>
                    <Image source={require('../../../../assets/Elemento_tabela.png')} style={styles.image3} />

                </View>
                <OpButton theme={"nextButton"} title="Voltar" onPressFunction={() => navigation.navigate("Home")} />
            </ScrollView>
        </View>
    )
}

export function Basic3_html({ navigation }) {
    return (
        <View style={styles.container}>
            <ScrollView>
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
                <View style={{ alignItems: 'center', margin: 10, marginBottom: 100 }}>
                    <Text style={styles.text}>
                        Agora sem mais enrolação, os primeiros elementos que veremos é o &#10094;header&#10095; e o &#10094;h1&#10095;.
                        O header é o elemento utilizado para separar o cabeçalho do resto do corpo de seu documento. Nele pode ser
                        colocado outros elementos, mas normalmente é acompanhado pelos elementos h1 até o h6.
                    </Text>
                    <Image source={require('../../../../assets/Header.png')} style={styles.image} />
                    <Image source={require('../../../../assets/Header2.png')} style={[styles.image, { height: 290 }]} />
                </View>
                <OpButton theme={"nextButton"} title="Voltar" onPressFunction={() => navigation.navigate("Home")} />
            </ScrollView>
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