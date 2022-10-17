import React, { Component } from 'react';
import {
    Image,
    Switch,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Accordion from 'react-native-collapsible/Accordion';
import OpButton from './Helpers/OpButton';
import Icon, { Icons } from './components/Icons';

const Linguagem = 'HTML'

const CONTENT = [
    {
        title: 'Módulo 1',
        content: 'oi',
    },
    {
        title: 'Second',
        content: 'oi',
    },
];

export default class Testes extends Component {
    state = {
        activeSections: [],
        collapsed: true,
        multipleSelect: false,
    };

    toggleExpanded = () => {
        this.setState({ collapsed: !this.state.collapsed });
    };

    setSections = (sections) => {
        this.setState({
            activeSections: sections.includes(undefined) ? [] : sections,
        });
    };

    renderHeader = (section, _, isActive) => {
        return (
            <View style={styles.class}>
                <Text style={styles.title}>{section.title}</Text>
                <Text style={styles.text}>Conceitos básicos de {Linguagem}</Text>
                <Image style={styles.figure} source={require('../assets/Robo_basics.png')} />
            </View>
        );
    };

    renderContent(section, _, isActive) {
        return (
            <View style={{ flexDirection: "row" }} >
                <Icon
                    type={Icons.MaterialCommunityIcons}
                    name="subdirectory-arrow-right"
                    color={"#33526E"}
                    size={80}
                    style={styles.icon}
                />
                <OpButton theme={"classButton"} title={section.content} />
            </View>
        );
    }

    render() {
        const { multipleSelect, activeSections } = this.state;

        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={{ paddingTop: 30 }}>
                    <Accordion
                        activeSections={activeSections}
                        sections={CONTENT}
                        touchableComponent={TouchableOpacity}
                        renderHeader={this.renderHeader}
                        renderContent={this.renderContent}
                        onChange={this.setSections}
                        renderAsFlatList={false}
                    />
                </ScrollView>
            </View>
        );
    }
}

/*
<View>
    <View style={{ height: 20, width: 2, color: "white" }} />
    <View >
        <View style={{ height: 2, width: 2, borderRadius: 1, color: "white" }} />
        <View style={{ height: 2, width: 20, color: "white" }} />
    </View>
    <View style={{ height: 20, width: 2, color: "white" }} />
</View>
*/

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141f29',
        paddingTop: 10,
    },
    class: {
        height: 130,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: '#141f29',
        borderRadius: 20,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
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
        top: -75,
        left: -50,
        width: 240,
        height: 240,
    },
    icon: {
        left: 25,
        marginRight: 10,
    },
});