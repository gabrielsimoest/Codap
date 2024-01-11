import { View, TouchableOpacity, Modal, Image, StyleSheet } from 'react-native';
import Icon, { Icons } from '../Icons';
import OpButton from './OpButton';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AText from './AText';

const textSize = 29.8;

export default function SorryView({ navigation }) {

    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    const {colors} = useTheme(); //Cores do tema

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')} 
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
                    <AText style={[styles.text, {color: colors.text}]} defaultSize={textSize}>{t("you'll do better next time!")}</AText>
                </View>
                <Image style={styles.figure} source={require('../../../assets/Robo_triste.png')} />
            </View>
            <OpButton theme={"nextButton"} title={t("back")} onPressFunction={() => navigation.navigate('Home')} />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#0E151C',
    },
    text: {
        margin: 20,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: '#fff',
        fontSize: 30,
        fontWeight: "bold"
    },
    icon: {
        marginRight: 20,
        top: 10,
    },
    figure: {
        top: "10%",
        left: "20%",
        width: "60%",
        height: "60%",
    },

})
