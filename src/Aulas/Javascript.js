import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import CollapseJS from './ClassButtonList/CollapseJS';

export default function Javascript() {
  return (
    <ScrollView style={styles.scroller}>
      <CollapseJS />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    marginHorizontal: 10,
    height: '81%',
  },
});
