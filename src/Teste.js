import React, { Component } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import OpButton from '../../Helpers/OpButton';
import Icon, { Icons } from '../../components/Icons';
import { useNavigation } from '@react-navigation/native';

const Linguagem = 'HTML'

export default class CollapseHtml extends Component {
    state = {
        collapsed: true,
        collapsed2: true,
        collapsed3: true,
        collapsed4: true,
    };

    toggleExpanded = () => {
        this.setState({ collapsed: !this.state.collapsed });
    };
    toggleExpanded2 = () => {
        this.setState({ collapsed2: !this.state.collapsed2 });
    };
    toggleExpanded3 = () => {
        this.setState({ collapsed3: !this.state.collapsed3 });
    };
    toggleExpanded4 = () => {
        this.setState({ collapsed4: !this.state.collapsed4 });
    };

    render() {

        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={this.toggleExpanded}
                    style={styles.class}
                >
                    <Text style={styles.title}>Módulo 1</Text>
                    <Text style={styles.text}>Conceitos básicos de {Linguagem}</Text>
                    <Image style={styles.figure} source={require('../../../assets/Robo_basics.png')} />
                </TouchableOpacity>
                <Collapsible collapsed={this.state.collapsed}>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Estrutura básica" onPressFunction={() => navigation.navigate('Teste2')} />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                </Collapsible>
                <TouchableOpacity
                    onPress={this.toggleExpanded2}
                    style={styles.class}
                >
                    <Text style={styles.title}>Módulo 2</Text>
                    <Text style={styles.text}>{Linguagem} intermediário</Text>
                    <Image style={styles.figure2} source={require('../../../assets/Robo_inter.png')} />
                </TouchableOpacity>
                <Collapsible collapsed={this.state.collapsed2}>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                </Collapsible>
                <TouchableOpacity
                    onPress={this.toggleExpanded3}
                    style={styles.class}
                >
                    <Text style={styles.title}>Módulo 3</Text>
                    <Text style={styles.text}>{Linguagem} avançado</Text>
                    <Image style={styles.figure} source={require('../../../assets/Robo_basics.png')} />
                </TouchableOpacity>
                <Collapsible collapsed={this.state.collapsed3}>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                </Collapsible>
                <TouchableOpacity
                    onPress={this.toggleExpanded4}
                    style={styles.class}
                >
                    <Text style={styles.title}>Módulo 4</Text>
                    <Text style={styles.text}>Maestria em {Linguagem}</Text>
                    <Image style={styles.figure} source={require('../../../assets/Robo_basics.png')} />
                </TouchableOpacity>
                <Collapsible collapsed={this.state.collapsed4}>
                    <View style={{ flexDirection: "row" }} >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-caret-forward-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                </Collapsible>
            </View>
        );
    }
}