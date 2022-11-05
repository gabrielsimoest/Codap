import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import Icon, { Icons } from '../components/Icons';
import OpButton from './OpButton';
import AText from './AText';

const textSize = 20;

export default function TeoricView({ navigation, progresso, txt, adicionaltxt, adicionaltxt2, adicionaltxt_end, img, opt_img, opt_img2, navegar }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const { colors } = useTheme(); //Variavel de cor do tema

    const [Textadd, setTextadd] = useState('Textadd')
    const [Textadd2, setTextadd2] = useState('Textadd')
    const [Textadd3, setTextadd3] = useState('Textadd')
    const [Imgadd, setImgadd] = useState('Imgadd')
    const [Imgadd2, setImgadd2] = useState('Imgadd')
    const [Imgadd3, setImgadd3] = useState('Imgadd')

    useEffect(() => {
        if (adicionaltxt != 'none')
            setTextadd('text')
        if (adicionaltxt2 != 'none')
            setTextadd2('text')
        if (adicionaltxt_end != 'none')
            setTextadd3('text')
        if (opt_img != 'none')
            setImgadd('figure')
        if (opt_img2 != 'none')
            setImgadd2('figure')
        if (img != 'none')
            setImgadd3('figure')
    }, [])

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.progressBar}><View style={[StyleSheet.absoluteFill, { backgroundColor: "#637aff", width: progresso }]} /></View>
            <ScrollView style={{ width: '98%', marginBottom: '25%' }}>
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
                <View style={{ alignItems: "stretch" }}>
                    <AText style={[styles.text, { color: colors.text }]} defaultSize={textSize}>{txt}</AText>
                    <AText style={[styles[Textadd], { color: colors.text }]} defaultSize={textSize}>{adicionaltxt}</AText>
                    <AText style={[styles[Textadd2], { color: colors.text }]} defaultSize={textSize}>{adicionaltxt2}</AText>
                    <View style={{ alignItems: "center" }}>
                        <Image style={styles[Imgadd3]} source={img} />
                        <Image style={styles[Imgadd]} source={opt_img} />
                        <Image style={styles[Imgadd2]} source={opt_img2} />
                    </View>
                    <AText style={[styles[Textadd3], { color: colors.text }]} defaultSize={textSize}>{adicionaltxt_end}</AText>
                </View>
            </ScrollView>
            <OpButton theme={"nextButton"} title={t("next")} onPressFunction={() => navigation.navigate(navegar)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#0E151C',
    },
    text: {
        margin: 10,
        // flexGrow: 1,
        fontFamily: 'Roboto',
    },
    Textadd: {
        display: 'none'
    },
    progressBar: {
        top: -2,
        height: 8,
        width: '100%',
        backgroundColor: 'white',
    },
    figure: {
        margin: 10,
        width: 230,
        height: 203,
    },

})