import React from 'react';
import {
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon, { Icons } from '../components/Icons';

function OpButton({ theme, title, onPressFunction, iconType, iconName, iconColor, iconSize, textColor="white" }) {

    return (
        <TouchableOpacity style={styles[theme]} onPress={onPressFunction}>
            <Icon type={Icons[iconType]}
                name={iconName}
                color={iconColor}
                size={iconSize}
                style={styles.icon} />
            <Text style={[styles.text, {color: textColor}]}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({

    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: '#141f29',
        borderRadius: 20,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 7,
    },
    secundaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 50,
        padding: 10,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: '#141f29',
        borderRadius: 10,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 7,
    },
    classButton: {
        flexDirection: 'row',
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: '100%',
        marginLeft: 45,
        marginRight:45,
        marginBottom: 15,
        backgroundColor: '#1B2B39',
        borderRadius: 10,
        elevation: 2,
    },
    nextButton: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width:'92%',
        left: 16,
        height: 50,
        bottom:30,
        backgroundColor: '#1B2B39',
        borderRadius: 20,
    },
    modalButton:{
        flexDirection: 'row',
        marginTop:20,
        alignItems: 'center',
        justifyContent: 'center',
        width:'92%',
        left: 16,
        height: 50,
        backgroundColor: 'green',
        borderRadius: 20,
    },
    modalButtonE:{
        flexDirection: 'row',
        marginTop:20,
        alignItems: 'center',
        justifyContent: 'center',
        width:'92%',
        left: 16,
        height: 50,
        backgroundColor: 'red',
        borderRadius: 20,
    },
    marketButton: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width:'42%',
        right: 56,
        height: 50,
        bottom:30,
        elevation: 20,
        backgroundColor: '#637aff',
        borderRadius: 20,
    },
    marketButton2: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width:'42%',
        left: 30,
        height: 50,
        bottom:30,
        elevation: 20,
        backgroundColor: '#637aff',
        borderRadius: 20,
    },
    OptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 70,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        marginBottom: 7,
        backgroundColor: '#141f29',
        borderRadius: 20,
        elevation: 10,
    },
    OptionButtonTrue: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 70,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        marginBottom: 7,
        backgroundColor: 'green',
        borderRadius: 20,
        elevation: 10,
    },
    settingsButton: {
        flexDirection: 'row',
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: '90%',
        margin: 15,
        marginBottom: 1,
        backgroundColor: '#1B2B39',
        borderRadius: 10,
        elevation: 2,
    },
    text: {
        //position: 'absolute',
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 20,
    },
    text2: {
        fontFamily: 'Roboto',
        color: '#E5E5E5',
        fontSize: 20,
    },
    icon: {
        marginRight: 10,
    }

})

export default OpButton;