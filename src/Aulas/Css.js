import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import CollapseCSS from './ClassButtonList/CollapseCSS';

export default function Css() {
  return (
    <ScrollView style={styles.scroller}>
      <CollapseCSS />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    marginHorizontal: 10,
    height: '81%',
  },
});
