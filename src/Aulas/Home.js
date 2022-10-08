import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Keyboard,
    Image
} from 'react-native';

import AppHeader from '../components/MyHeader';

export default function Home({ navigation }) {

    return (
        <View styles={styles.body}>
            <AppHeader/>
        </View>
    )
}

const styles = StyleSheet.create({
    body: {
        backgroundColor: '#141f20'
    },
    
})
