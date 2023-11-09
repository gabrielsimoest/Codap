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
                    <AText style={[styles.text, {color: colors.text}]} defaultSize={textSize}>Você melhora na próxima!</AText>
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
        top: -2,
        height: 8,
        width: '100%',
        backgroundColor: 'white',
    },
    text2: {
        marginLeft: 20,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: '#637aff',
        fontSize: 25,
        fontWeight: "bold"
    },
    figure: {
        top: "3%",
        left: "-41.5%",
        width: 720,
        height: 460,
    },

})
