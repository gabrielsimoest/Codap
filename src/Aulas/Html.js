
import React, { useState } from 'react';
import { TouchableOpacity, Text, ScrollView, Image, StyleSheet } from 'react-native';
import CollapseHtml from './ClassButtonList/CollapseHtml';

export default function Html() {
    return (
        <ScrollView style={styles.scroller} >
            <CollapseHtml/>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scroller: {
        marginHorizontal: 10,
        height: 630,
        paddingBottom: 500
    },

})