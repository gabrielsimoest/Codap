import {useTheme} from '@react-navigation/native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import Icon, {Icons} from '../Icons';
import OpButton from './OpButton';
import ASyntaxHighlighter from './ASyntaxHighlight';
import {atomOneLight, atomOneDark} from 'react-syntax-highlighter/styles/hljs';
import SaveClass from './SaveClass';
import AHighlighter from './AHighlighter';
import {useSelector} from 'react-redux';
import WebView from 'react-native-webview';
import { TutorialTheory } from './Tutorials';
import { useContext } from 'react';
import { AppContext } from '../../common/Contexts/AppContext';
import { CustomDarkMode } from '../../common/Themes/DefaultThemes';

const textSize = 20;

export default function TheoryView({
  mainText = 'Teste main',
  secondText,
  thirdText,
  endText,
  highlight = [''],
  codeLanguage = 'HTML',
  code = `<!DOCTYPE html>
  <html>
    <head>
      <title>Minha página</title>
    </head>
    <body>
      <h1>Minha página</h1>
      <p>Esta é a minha primeira página HTML!</p>
    </body>
  </html>`,
  onlyCode = false,
  tutorialVisible = false,
  navigation,
  navegar= "Home",
  aulaSalvar="none", 
  Salvar,
  progresso = "0%",
}) {
  //Constante de tradução, usar {t("CHAVE")} para tradução
  const {t, i18n} = useTranslation();

  const {colors} = useTheme(); //Variavel de cor do tema

  const { theme, toggleTheme } = useContext(AppContext);

  /* //Definir tema usando currentTheme (padrão true)
  let currentTheme = useSelector(state => {
    return state.myDarkMode;
  }); */

  //Troca entre as abas do seletor
  const [isIndexVisible, setIndexVisible] = useState(true);
  const toggleContent = () => {
    setIndexVisible(!isIndexVisible);
  };

  //Define que apenas o código é visível
  const [OnlyCodeVisible, setCodeOnly] = useState(onlyCode);

  //Define tutorial visivel
  const [TutorialVisible, setTutorialVisible] = useState(tutorialVisible);

  //Define os textos opcionais visiveis
  const [SecondTextVisible, setSecondTextVisible] = useState(
    secondText != "none"? true : false,
  );
  const [ThirdTextVisible, setThirdTextVisible] = useState(
    thirdText != "none" ? true : false,
  );
  const [EndTextVisible, setEndTextVisible] = useState(
    endText != "none"? true : false,
  );

  //Obtem o tamanho do sintax highlight para aplicar no webView
  const [highlighterHeight, setHighlighterHeight] = useState(100);
  const onHighlighterLayout = event => {
    const {height} = event.nativeEvent.layout;
    setHighlighterHeight(height);
  };

  const txtToHighlight = highlight;

  return (
    <View style={[styles.container, {backgroundColor: colors.card}]}>
      <View style={styles.progressBar} /*Progress Bar*/>
        <View
          style={[
            StyleSheet.absoluteFill,
            {backgroundColor: '#637aff', width: progresso},
          ]}
        />
      </View>
      {/*BODY*/}
      <View style={[styles.container, {backgroundColor: colors.card}]}>
        <ScrollView style={{marginBottom: '20%'}}>
          {/*BUTTON*/}
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={{width: 60}}>
              <Icon
                type={Icons.Ionicons}
                name="ios-close-outline"
                color={'#33526E'}
                size={60}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTutorialVisible(!TutorialVisible)}
              style={{width: 50, top: 8, marginLeft: '72%'}}>
              <Icon
                type={Icons.Ionicons}
                name="help-circle-outline"
                color={'#33526E'}
                size={45}
              />
            </TouchableOpacity>
          </View>
          {/*BUTTON_END*/}
          <TutorialTheory visible={TutorialVisible} setModalVisible={setTutorialVisible}/>
          <SaveClass aulaSalvar={aulaSalvar} Salvar={Salvar} />
          <AHighlighter
            style={[styles.text, {color: colors.text}]}
            highlight={{color: '#637aff'}}
            wordHighlight={txtToHighlight}
            text={mainText}
            defaultSize={textSize}
          />
          {SecondTextVisible ? (
            <AHighlighter
              style={[styles.text, {color: colors.text}]}
              highlight={{color: '#637aff'}}
              wordHighlight={txtToHighlight}
              text={secondText}
              defaultSize={textSize}
            />
          ) : (
            <View style={{display: 'none'}} />
          )}
          {ThirdTextVisible ? (
            <AHighlighter
              style={[styles.text, {color: colors.text}]}
              highlight={{color: '#637aff'}}
              wordHighlight={txtToHighlight}
              text={thirdText}
              defaultSize={textSize}
            />
          ) : (
            <View style={{display: 'none'}} />
          )}

          {/*CODE SECTION*/}
          {OnlyCodeVisible ? (
            <View
              style={[
                theme == CustomDarkMode ? styles.codeArea : styles.codeAreaLight,
                {width: '100%', marginVertical: 20},
              ]}>
              <ASyntaxHighlighter
                language={codeLanguage}
                style={theme == CustomDarkMode ? atomOneDark : atomOneLight}
                code={code}
              />
            </View>
          ) : (
            <View>
              <View style={{flexDirection: 'row', marginTop: '3%'}}>
                <Pressable
                  style={
                    isIndexVisible
                      ? theme == CustomDarkMode
                        ? styles.buttonIndex
                        : styles.LightButtonIndex
                      : theme == CustomDarkMode
                      ? styles.buttonIndex_deselected
                      : styles.LightButtonIndex_deselected
                  }
                  onPress={toggleContent}>
                  <Text
                    style={[
                      styles.textButton,
                      {color: colors.text, right: '6%'},
                    ]}>
                    Index
                  </Text>
                </Pressable>
                <Pressable
                  style={
                    isIndexVisible
                      ? theme == CustomDarkMode
                        ? styles.buttonWeb_deselected
                        : styles.LightButtonWeb_deselected
                      : theme == CustomDarkMode
                      ? styles.buttonWeb
                      : styles.LightButtonWeb
                  }
                  onPress={toggleContent}>
                  <Text style={[styles.textButton, {color: colors.text}]}>
                    Web
                  </Text>
                </Pressable>
              </View>
              <View
                style={theme == CustomDarkMode ? styles.codeArea : styles.codeAreaLight}>
                {/*Start code view*/}
                {isIndexVisible ? (
                  <View style={{width: '100%'}} onLayout={onHighlighterLayout}>
                    <ASyntaxHighlighter
                      language={codeLanguage}
                      style={theme == CustomDarkMode ? atomOneDark : atomOneLight}
                      code={code}
                    />
                  </View>
                ) : (
                  <View style={{width: '100%', height: highlighterHeight}}>
                    <WebView
                      source={{html: code}}
                      containerStyle={{
                        flex: 0,
                        height: highlighterHeight,
                      }}
                      textZoom={220}
                      nestedScrollEnabled={true}
                    />
                  </View>
                )}
                {/*End code view*/}
              </View>
            </View>
          )}

          {EndTextVisible ? (
            <AHighlighter
              style={[styles.text, {color: colors.text}]}
              highlight={{color: '#637aff'}}
              wordHighlight={txtToHighlight}
              text={endText}
              defaultSize={textSize}
            />
          ) : (
            <View style={{display: 'none'}} />
          )}
        </ScrollView>
        <View>
          <OpButton
            theme={'nextButton'}
            title={t('next')}
            onPressFunction={() => navigation.navigate(navegar)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  progressBar: {
    top: -2,
    height: 8,
    width: '100%',
    backgroundColor: '#273f55',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Roboto',
    marginLeft: '1%',
    marginRight: '1%',
    textAlign: "justify"
  },
  textButton: {
    fontSize: 18,
    fontFamily: 'Roboto',
  },

  //Dark button

  buttonIndex: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#304D66',
    width: '20%',
    borderTopStartRadius: 5,
    borderTopEndRadius: 30,
    zIndex: 99,
  },
  buttonIndex_deselected: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B2B39',
    width: '20%',
    borderTopStartRadius: 5,
    borderTopEndRadius: 30,
    zIndex: 1,
  },
  buttonWeb: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#304D66',
    width: '20%',
    borderTopStartRadius: 5,
    borderTopEndRadius: 30,
    right: '55%',
    zIndex: 99,
  },
  buttonWeb_deselected: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B2B39',
    width: '20%',
    borderTopStartRadius: 5,
    borderTopEndRadius: 30,
    right: '55%',
    zIndex: 1,
  },

  //Light button

  LightButtonIndex: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A5A5A5',
    width: '20%',
    borderTopStartRadius: 5,
    borderTopEndRadius: 30,
    zIndex: 99,
  },
  LightButtonIndex_deselected: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757575',
    width: '20%',
    borderTopStartRadius: 5,
    borderTopEndRadius: 30,
    zIndex: 1,
  },
  LightButtonWeb: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A5A5A5',
    width: '20%',
    borderTopStartRadius: 5,
    borderTopEndRadius: 30,
    right: '55%',
    zIndex: 99,
  },
  LightButtonWeb_deselected: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757575',
    width: '20%',
    borderTopStartRadius: 5,
    borderTopEndRadius: 30,
    right: '55%',
    zIndex: 1,
  },

  //Code area dark

  codeArea: {
    borderWidth: 5,
    borderColor: '#304D66',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    marginBottom: '3%',
  },

  //Code area light

  codeAreaLight: {
    borderWidth: 5,
    borderColor: '#A5A5A5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    marginBottom: '3%',
  },
});
