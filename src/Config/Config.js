import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
} from 'react-native';
import DefaultHeader from '../components/DefaultHeader';
import OpButton from '../Helpers/OpButton';
import Icon, { Icons } from '../components/Icons';
import TranslateComponet from './TranslateComponent';
import FontComponent from './FontComponent';
import { useTranslation } from 'react-i18next';
import AText from '../Helpers/AText';
import ThemeComponent from './ThemeComponent';
import { useTheme } from '@react-navigation/native';

const TextSize1 = 25;

export default function Config({ navigation }) {

    const {colors} = useTheme(); //Variavel de cor do tema

    const { t, i18n } = useTranslation();

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <DefaultHeader title={t("settings")}/>

            <ScrollView style={styles.scroller} showsVerticalScrollIndicator={false}>
                <View style={[{ flexDirection: "row" }, { alignItems: "center" }]}>
                    <Icon type={Icons.MaterialCommunityIcons} name="cellphone-cog" style={styles.icon} size={25} color={"#5469D3"} />
                    <AText style={styles.text} defaultSize={TextSize1}>{t("system")}</AText><View style={[styles.line, {backgroundColor: colors.text}]} />
                </View>
                <TranslateComponet/>
                <FontComponent/>
                <ThemeComponent/>
                <View style={[{ flexDirection: "row" }, { alignItems: "center" }]}>
                    <Icon type={Icons.Ionicons} name="notifications" style={styles.icon} size={25} color={"#5469D3"} />
                    <AText style={styles.text} defaultSize={TextSize1}>{t("notification")}</AText><View style={[styles.line, {backgroundColor: colors.text}]} />
                </View>
                <OpButton theme='secundaryButton' textStyle='text2' title={t("notifications")} onPressFunction={() => console.log("teste")} />
                <View style={[{ flexDirection: "row" }, { alignItems: "center" }]}>
                    <Icon type={Icons.MaterialCommunityIcons} name="information-outline" style={styles.icon} size={25} color={"#5469D3"} />
                    <AText style={styles.text} defaultSize={TextSize1}>{t("informations")}</AText><View style={[styles.line, {backgroundColor: colors.text}]}/>
                </View>
                <OpButton theme='secundaryButton' textStyle='text2' title={t("update")} onPressFunction={() => console.log("teste")} />
                <OpButton theme='secundaryButton' textStyle='text2' title={t("version")} onPressFunction={() => console.log("teste")} />
                <OpButton theme='secundaryButton' textStyle='text2' title={t("about")} onPressFunction={() => console.log("teste")} />
            </ScrollView>
        </View>

    )
}


const styles = StyleSheet.create({

    container: {
        //backgroundColor: '#141f29',
        height: "100%",
    },
    scroller: {
        width: '90%',
        marginLeft: '5%',
        marginBottom: '18%',
    },
    direction: {
        flexDirection: "row",
        alignItems: "center",
        height: "30%",
        marginBottom: 15,
        backgroundColor: '#141f29',
        borderTopWidth: 2,
        borderTopColor: 'rgba(0,0,0, 0.2)',
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 7,
    },
    account: {
        left: "5%",
        borderRadius: 75,
        backgroundColor: "#33526E",
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 20,
    },
    components: {
        flexDirection: "column",
        width: "48%",
        marginLeft: '10%',
    },
    text: {
        color: "#5469D3",
        fontSize: 25,
        marginTop: 20,
        marginRight: 10,
    },
    text2: {
        color: "#5469D3",
        fontSize: 19,
        marginBottom: 20,
    },
    line: {
        height: 1,
        marginTop: 25,
        marginRight: 10,
        backgroundColor: 'white',
        flexGrow: 1,
    },
    icon: {
        marginTop: 20,
        marginRight: 10,
    }
})