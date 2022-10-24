import React, { useState } from 'react';
import {
    Image,
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

export default function CollapseHtml () {

    const navigation = useNavigation();

    var [collapsed1, setState] = useState(true);
    var [collapsed2, setState2] = useState(true);
    var [collapsed3, setState3] = useState(true);
    var [collapsed4, setState4] = useState(true);

   var toggleExpanded = () => {
        setState(collapsed1 = !collapsed1 );
    };
   var toggleExpanded2 = () => {
        setState2(collapsed2= !collapsed2 );
    };
   var toggleExpanded3 = () => {
        setState3(collapsed3= !collapsed3);
    };
   var toggleExpanded4 = () => {
        setState4(collapsed4= !collapsed4);
    };
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={toggleExpanded}
                    style={styles.class}
                >
                    <Text style={styles.title}>Módulo 1</Text>
                    <Text style={styles.text}>Conceitos básicos de {Linguagem}</Text>
                    <Image style={styles.figure} source={require('../../../assets/Robo_basics.png')} />
                </TouchableOpacity>
                <Collapsible collapsed={collapsed1}>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Descobrindo HTML e Tags" onPressFunction={() => navigation.navigate('BasicPrat1_html')} />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Estruturando Textos" onPressFunction={() => navigation.navigate('Basic1_html')} />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Construindo Botoes" onPressFunction={() => navigation.navigate('Basic2_html')}/>
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Criando Links" onPressFunction={() => navigation.navigate('Basic3_html')}/>
                    </View>
                    <View style={styles.line}></View>
                </Collapsible>
                <TouchableOpacity
                    onPress={toggleExpanded2}
                    style={styles.class}
                >
                    <Text style={styles.title}>Módulo 2</Text>
                    <Text style={styles.text}>{Linguagem} intermediário</Text>
                    <Image style={styles.figure2} source={require('../../../assets/Robo_inter.png')} />
                </TouchableOpacity>
                <Collapsible collapsed={collapsed2}>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={styles.line}></View>
                </Collapsible>
                <TouchableOpacity
                    onPress={toggleExpanded3}
                    style={styles.class}
                >
                    <Text style={styles.title}>Módulo 3</Text>
                    <Text style={styles.text}>{Linguagem} avançado</Text>
                    <Image style={styles.figure3} source={require('../../../assets/Robo_advanced.png')} />
                </TouchableOpacity>
                <Collapsible collapsed={collapsed3}>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={styles.line}></View>
                </Collapsible>
                <TouchableOpacity
                    onPress={toggleExpanded4}
                    style={styles.class}
                >
                    <Text style={styles.title}>Módulo 4</Text>
                    <Text style={styles.text}>Maestria em {Linguagem}</Text>
                    <Image style={styles.figure3} source={require('../../../assets/Robo_master.png')} />
                </TouchableOpacity>
                <Collapsible collapsed={collapsed4}>
                    <View style={{ flexDirection: "row" }} >
                        <OpButton theme={"classButton"} title="Teste" />
                    </View>
                    <View style={styles.line}></View>
                </Collapsible>
            </View>
        )
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
        top: -70,
        left: -50,
        width: 240,
        height: 240,
    },
    figure2: {
        top: -70,
        left: -35,
        width: 240,
        height: 240,
    },
    figure3: {
        top: -45,
        left: -60,
        width: 240,
        height: 240,
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
        marginRight: 15
    }
});
