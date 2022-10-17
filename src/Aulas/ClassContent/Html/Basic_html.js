import React from 'react';
import {Text, ScrollView, Image, StyleSheet, View } from 'react-native';
import DefaultHeader from '../../../components/DefaultHeader';
import OpButton from '../../../Helpers/OpButton';

export function Basic1_html({navigation}) {
    return (
        <View style={styles.container}>
            <DefaultHeader title={"      Estrutura básica"} />
            <View style={styles.box}>
            <ScrollView style={styles.scroller} >
                <View style={{ alignItems: 'center', margin: 10, }}>
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
                    <OpButton theme={"nextButton"} title="Próxima aula" onPressFunction={() => navigation.navigate("Basic2_html")}/>
                </View>
            </ScrollView>
            </View>
        </View>
    )
}

export function Basic2_html({ navigation }) {
    return (
        <View style={styles.container}>
            <DefaultHeader title={"      Elementos"} />
            <View style={styles.box}>
                <ScrollView style={styles.scroller} >
                    <View style={{ alignItems: 'center', margin: 10, }}>
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
                        <OpButton theme={"nextButton"} title="Próxima aula" onPressFunction={() => navigation.navigate("Basic3_html")} />
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export function Basic3_html({ navigation }) {
    return (
        <View style={styles.container}>
            <DefaultHeader title={"      <header> e <h1>"} />
            <View style={styles.box}>
                <ScrollView style={styles.scroller} >
                    <View style={{ alignItems: 'center', margin: 10, }}>
                        <Text style={styles.text}>
                            Agora sem mais enrolação, os primeiros elementos que veremos é o &#10094;header&#10095; e o &#10094;h1&#10095;. 
                            O header é o elemento utilizado para separar o cabeçalho do resto do corpo de seu documento. Nele pode ser
                            colocado outros elementos, mas normalmente é acompanhado pelos elementos h1 até o h6.
                        </Text>
                        <Image source={require('../../../../assets/Header.png')} style={styles.image} />
                        <Image source={require('../../../../assets/Header2.png')} style={[styles.image, { height: 290 }]} />
                        <OpButton theme={"nextButton"} title="Próxima aula" onPressFunction={() => navigation.navigate("Basic3_html")} />
                    </View>
                </ScrollView>
            </View>
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
        borderRadius: 20,
        borderColor: 'rgba(99, 122, 255, 0.2)',
        borderWidth: 6,
        height: "92%",
        width: "97%",
    },
    text: {
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 20,
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
    }

})