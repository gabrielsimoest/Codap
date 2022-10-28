import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Title } from 'react-native-paper';

function HeaderUser ({title , XP}) {

  return (
    <View style={styles.header}>
      <Title style={{ color: 'white', fontFamily: 'Roboto', marginLeft: 30}}>{title}</Title>
      <View style={styles.xpStyle}>
                    <Text style={styles.textXP}
                        adjustsFontSizeToFit={true}
                        numberOfLines={3}   
                    >XP: {XP}</Text>
                    </View>
    </View>
  )
}

export default HeaderUser;

const styles = StyleSheet.create({
    header: {
      height: 50,
      elevation: 4,
      alignItems: 'center',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      borderWidth: 2,
      borderColor: 'rgba(0,0,0, 0.2)',
      backgroundColor: '#141f29',
  
      shadowColor: 'rgba(0,0,0, 0.3)',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 5,
      shadowOpacity: 0.28,
      shadowRadius: 4,
    },
    textXP: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom:0.5,
    },
    xpStyle:{
        paddingLeft:15,
        borderColor:'#627bff',
        borderWidth:2,
        borderRadius: 50,
        height: '60%',
        width: '35%',
        marginRight: '3%',
    }
  });