import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Surface, Title } from 'react-native-paper';
import Icons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Octicons';
import { white } from 'react-native-paper/lib/typescript/styles/colors';

function DefaultHeader ({title}) {

  return (
    <View style={styles.header}>
      <Title style={{ color: 'white',fontFamily: 'Roboto' }}>{title}</Title>
    </View>
  )
}

export default DefaultHeader;

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
  });