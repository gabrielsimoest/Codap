import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';  
import Icon, {Icons} from '../components/Icons';  

function OpButton({theme, title, onPressFunction, iconType, iconName, iconColor, iconSize}) {

    return (
        <TouchableOpacity style = {styles[theme]} onPress={onPressFunction}>
            <Icon   type={ Icons[iconType]}
                        name= {iconName}
                        color={iconColor}
                        size={iconSize} 
                        style={styles.icon}/>
            <Text style = {styles.text}>{title}</Text>
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
    text: {
//        position: 'absolute',
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
    },
    icon: {
        marginRight: 10,
    }

})

export default OpButton;