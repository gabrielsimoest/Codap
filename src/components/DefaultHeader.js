import React from 'react';
<<<<<<< Updated upstream
import { View, StyleSheet, Text } from 'react-native';
import { Title } from 'react-native-paper';
=======
import { View, StyleSheet} from 'react-native';
import { Title } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
>>>>>>> Stashed changes

function DefaultHeader ({title}) {

  const {colors} = useTheme();

  return (
    <View style={[styles.header, {backgroundColor: colors.background}]}>
      <Title style={{ color: colors.text, fontFamily: 'Roboto', marginLeft: 30}}>{title}</Title>
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