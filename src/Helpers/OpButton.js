import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon, { Icons } from '../components/Icons';

function OpButton({ theme, textStyle = 'text', title, onPressFunction, iconType, iconName, iconColor, iconSize }) {

    return (
        <TouchableOpacity style={styles[theme]} onPress={onPressFunction}>
            <Icon type={Icons[iconType]}
                name={iconName}
                color={iconColor}
                size={iconSize}
                style={styles.icon} />
            <Text style={styles[textStyle]}>{title}</Text>
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
        height: 80,
        width: '100%',
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
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: '100%',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 15,
        marginBottom: 15,
        backgroundColor: '#1B2B39',
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
    text: {
        //        position: 'absolute',
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
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