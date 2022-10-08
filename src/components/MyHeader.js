import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Title } from 'react-native-paper';
import Icons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Fontisto';
import { white } from 'react-native-paper/lib/typescript/styles/colors';

const AppHeader = ({
  style,
}) => {
  const LeftView = () => (
    <View style={styles.view}>
      <Icons name="keyboard-arrow-down" size={30} color="white" />
    </View>
  );
  const TitleView = () => (
    <View style={styles.titleView}>
      <Title style={{ color: 'white',fontFamily: 'Roboto'  }}>CSS</Title>
    </View>
  );
  const RightView = () => (
    <View style={[styles.view, styles.rightView]}>
      <Icon name="css3" size={25} color="#637aff" />
    </View>
  );
  return (
    <Surface style={[styles.header, style, { backgroundColor: '#141f29', }]}>
      <LeftView />
      <TitleView />
      <RightView />
    </Surface>
  );
};

export default AppHeader;

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
    flex: 1,
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
