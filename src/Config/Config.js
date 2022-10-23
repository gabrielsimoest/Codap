import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import DefaultHeader from '../components/DefaultHeader';
import OpButton from '../Helpers/OpButton';
import Icon, { Icons } from '../components/Icons';
import TranslateComponet from './TranslateComponent';
import FontComponent from './FontComponent';
import { useTranslation } from 'react-i18next';


export default function Config({ navigation }) {

    const { t, i18n } = useTranslation();

    return (
        <View style={styles.container}>
            <DefaultHeader title={t("settings")}/>

            <ScrollView style={styles.scroller} showsVerticalScrollIndicator={false}>
                <View style={[{ flexDirection: "row" }, { alignItems: "center" }]}>
                    <Icon type={Icons.MaterialCommunityIcons} name="cellphone-cog" style={styles.icon} size={25} color={"#5469D3"} />
                    <Text style={styles.text}>{t("system")}</Text><View style={styles.line} />
                </View>
                <TranslateComponet/>
                <FontComponent/>
                <OpButton theme='secundaryButton' textStyle='text2' title={t("theme")} onPressFunction={() => console.log("teste")} />
                <View style={[{ flexDirection: "row" }, { alignItems: "center" }]}>
                    <Icon type={Icons.Ionicons} name="notifications" style={styles.icon} size={25} color={"#5469D3"} />
                    <Text style={styles.text}>{t("notification")}</Text><View style={styles.line} />
                </View>
                <OpButton theme='secundaryButton' textStyle='text2' title={t("notifications")} onPressFunction={() => console.log("teste")} />
                <View style={[{ flexDirection: "row" }, { alignItems: "center" }]}>
                    <Icon type={Icons.MaterialCommunityIcons} name="information-outline" style={styles.icon} size={25} color={"#5469D3"} />
                    <Text style={styles.text}>{t("informations")}</Text><View style={styles.line} />
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
        backgroundColor: '#141f29',
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