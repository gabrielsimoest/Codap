import React, { useState } from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import Collapsible from 'react-native-collapsible';
import OpButton from '../components/Shared/OpButton';
import {
    useNavigation,
    useTheme,
} from '@react-navigation/native';
import AText from '../components/Shared/AText';
import RenderClassTest from './RenderClassTest';

const TitleTextSize = 23;
const textSize = 15;
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function ComponentTester() {
    //Salvar aulas
    const { colors } = useTheme(); //Cores do tema

    const navigation = useNavigation();

    var [collapsed1, setState] = useState(true);

    var toggleExpanded = () => {
        setState((collapsed1 = !collapsed1));
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity
                onPress={toggleExpanded}
                style={[styles.class, { backgroundColor: colors.primary }]}>
                <AText
                    style={[styles.title, { color: colors.text }]}
                    defaultSize={TitleTextSize}>
                    TESTES
                </AText>
                <AText
                    style={[styles.text, { color: colors.text }]}
                    defaultSize={textSize}>
                    Teste de componentes
                </AText>
            </TouchableOpacity>
            <Collapsible collapsed={collapsed1}>
                <View style={{ flexDirection: 'row' }}>
                    <OpButton
                        theme={'classButton'}
                        title="Teste de editor"
                        onPressFunction={() => navigation.navigate('TestCode')}
                    />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <OpButton
                        theme={'classButton'}
                        title="Teste de login"
                        onPressFunction={() => navigation.navigate('TestLogin')}
                    />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <OpButton
                        theme={'classButton'}
                        title="Teste do carousel tutorial"
                        onPressFunction={() => navigation.navigate('TestCarousel')}
                    />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <OpButton
                        theme={'classButton'}
                        title="dependabots"
                        onPressFunction={() => navigation.navigate('getDependabots')}
                    />
                </View>
                <RenderClassTest />
                <View style={[styles.line, { borderColor: colors.primary }]}></View>
            </Collapsible>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141f29',
    },
    class: {
        height: 140,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 15,
        marginBottom: 15,
        backgroundColor: '#1B2B39',
        borderRadius: 20,
        elevation: 7,
    },
    title: {
        position: 'absolute',
        right: 30,
        top: 55,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
    },
    text: {
        position: 'absolute',
        right: 30,
        top: 85,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 15,
    },
    figure: {
        left: windowWidth * 0.065,
        width: windowWidth * 0.189,
        height: windowHeight * 0.189,
    },
    icon: {
        left: 25,
        marginRight: 20,
        top: 20,
    },
    line: {
        borderBottomWidth: 2,
        borderColor: '#1B2B39',
        margin: 20,
        marginLeft: 15,
        marginRight: 15,
    },
});
