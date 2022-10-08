import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Title } from 'react-native-paper';
import Icons from 'react-native-vector-icons/MaterialIcons';

const AppHeader = ({
  style,
  headerBg = '#ffffff',
}) => {
  const LeftView = () => (
    <View style={styles.view}>
      <Icons name="keyboard-arrow-down" size={40} />
    </View>
  );
  const TitleView = () => (
    <View style={styles.titleView}>
      <Title>CSS</Title>
    </View>
  );
  return (
    <Surface style={[styles.header, style, { backgroundColor: headerBg }]}>
      <LeftView />
      <TitleView />
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
