import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Surface, Title } from 'react-native-paper';
import Icons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Octicons';
import { white } from 'react-native-paper/lib/typescript/styles/colors';

const HeaderShop = ({
  style,
}) => {
  const TitleView = () => (
    <View style={styles.titleView}>
      <Title style={{ color: 'white',fontFamily: 'Roboto' }}>      Market</Title>
    </View>
  );
  const RightView = () => (
    <View style={[styles.view, styles.rightView]}>
      <Text style={{ color: 'white',fontFamily: 'Roboto', fontSize:19 }}>20  </Text>
      <Icon name="dependabot" size={25} color="#fff" />
    </View>
  );
  return (
    <Surface style={[styles.header, style, { backgroundColor: '#141f29', }]}>
      <TitleView />
      <RightView />
    </Surface>
  );
};

export default HeaderShop;

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
    backgroundColor: '#141f20',

    shadowColor: 'rgba(0,0,0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
    shadowOpacity: 0.28,
    shadowRadius: 4,
  },
  view: {
    marginHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  titleView: {
    color: 'white',
  },
  rightView: {
    justifyContent: 'flex-end',
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
});
