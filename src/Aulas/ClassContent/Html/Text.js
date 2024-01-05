export function Basic1_html({ navigation }) {
    return (
        <View style={styles.container}>
            <View>
                <ScrollView  >
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Home")}
                    >
                        <Icon
                            type={Icons.Ionicons}
                            name="ios-close-outline"
                            color={"#33526E"}
                            size={60}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', margin: 10, marginBottom: 100 }}>
                        <Text style={styles.text}>
                            Olá, aqui é o Cody, fui instruído por meus criadores a ensinar diversas linguagens de programação diferentes. Vamos aprender sobre HTML?
                            Essa é uma linguagem muito usada para desenvolvimento Web, então é uma linguagem amplamente usada no mercado de trabalho.
                            Antes da nossa primeira aula, este é um exemplo de estrutura HTML:
                        </Text>
                        <Image source={require('../../../../assets/Estrutura.png')} style={styles.image} />
                        <Image source={require('../../../../assets/Estrutura2.png')} style={[styles.image, { height: 260 }]} />
                        <Text style={styles.text}>
                            Esse é um exemplo bem simples, mas com ele você já pode ter uma ideia de como funciona a estrutura. Vamos prosseguir para nossa aula.
                        </Text>
                    </View>
                    <OpButton theme={"nextButton"} title="Voltar" onPressFunction={() => navigation.navigate("Home")} />
                </ScrollView>
            </View>
        </View>
    )
}

export function Basic2_html({ navigation }) {
    return (
        <View style={styles.container}>
            <ScrollView>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                >
                    <Icon
                        type={Icons.Ionicons}
                        name="ios-close-outline"
                        color={"#33526E"}
                        size={60}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', margin: 10, marginBottom: 100 }}>
                    <Text style={styles.text}>
                        Como você pôde ver na aula passada, a estrutura é formada por tags de abertura e de fechamento. As tags são formadas por chaves anguladas dessa forma:
                        &#10094;CÓDIGO&#10095;, e são fechadas da mesma forma com uma barra na primeira chave: &#10094;/CÓDIGO&#10095;.
                        Esses são os chamados "Elementos", e o que fica entre as tags é o que chamamos de "Conteúdo".
                    </Text>
                    <Image source={require('../../../../assets/Elemento.png')} style={styles.image2} />
                    <Text style={styles.text}>
                        O conteúdo não se resume apenas a textos, podem ser colocados inclusive outros elementos.
                    </Text>
                    <Text style={styles.text}>Existem mais de 100 elementos com funções diferentes no HTML, mas as mais utilizadas são as seguintes:</Text>
                    <Image source={require('../../../../assets/Elemento_tabela.png')} style={styles.image3} />

                </View>
                <OpButton theme={"nextButton"} title="Voltar" onPressFunction={() => navigation.navigate("Home")} />
            </ScrollView>
        </View>
    )
}

export function Basic3_html({ navigation }) {
    return (
        <View style={styles.container}>
            <ScrollView>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                >
                    <Icon
                        type={Icons.Ionicons}
                        name="ios-close-outline"
                        color={"#33526E"}
                        size={60}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', margin: 10, marginBottom: 100 }}>
                    <Text style={styles.text}>
                        Agora sem mais enrolação, os primeiros elementos que veremos é o &#10094;header&#10095; e o &#10094;h1&#10095;.
                        O header é o elemento utilizado para separar o cabeçalho do resto do corpo de seu documento. Nele pode ser
                        colocado outros elementos, mas normalmente é acompanhado pelos elementos h1 até o h6.
                    </Text>
                    <Image source={require('../../../../assets/Header.png')} style={styles.image} />
                    <Image source={require('../../../../assets/Header2.png')} style={[styles.image, { height: 290 }]} />
                </View>
                <OpButton theme={"nextButton"} title="Voltar" onPressFunction={() => navigation.navigate("Home")} />
            </ScrollView>
        </View>
    )
}