import {useTheme} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import Icon, {Icons} from '../components/Icons';
import OpButton from './OpButton';
import ASyntaxHighlighter from './ASyntaxHighlight';
import {atomOneLight, atomOneDark} from 'react-syntax-highlighter/styles/hljs';
import SaveClass from './SaveClass';
import AHighlighter from './AHighlighter';
import {useSelector} from 'react-redux';

const textSize = 20;

export default function TheoryView({
  navigation,
  progresso,
  txt = 'Teste',
  adicionaltxt = 'Teste',
  adicionaltxt2,
  adicionaltxt_end = 'Teste',
  img,
  navegar,
  aulaSalvar,
  Salvar,
  txtToHighlight = [''],
  codeVisible = true,
}) {
  //Constante de tradução, usar {t("CHAVE")} para tradução
  const {t, i18n} = useTranslation();

  const {colors} = useTheme(); //Variavel de cor do tema

  let currentTheme = useSelector(state => {
    return state.myDarkMode;
  });

  const [isIndexVisible, setIndexVisible] = useState(true);
  const [isContentVisible, setContentVisible] = useState(true);
  const [Textadd, setTextadd] = useState(
    adicionaltxt != 'none' ? 'text' : 'TextInvisible',
  );
  const [Textadd2, setTextadd2] = useState(
    adicionaltxt2 != 'none' ? 'text' : 'TextInvisible',
  );
  const [Textadd3, setTextadd3] = useState(
    adicionaltxt_end != 'none' ? 'text' : 'TextInvisible',
  );
  const [Imgadd, setImgadd] = useState('figure');

  const toggleContent = () => {
    setIndexVisible(!isIndexVisible);
  };

  useEffect(() => {
    if (img != 'none') setImgadd('figure');
    if (codeVisible != true) setContentVisible(false);
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: colors.card}]}>
      <View style={styles.progressBar}>
        <View
          style={[
            StyleSheet.absoluteFill,
            {backgroundColor: '#637aff', width: progresso},
          ]}
        />
      </View>
      <View style={{height: '100%'}} /*BODY*/>
        <ScrollView style={{width: '98%', marginBottom: '20%'}}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon
              type={Icons.Ionicons}
              name="ios-close-outline"
              color={'#33526E'}
              size={60}
              style={styles.icon}
            />
          </TouchableOpacity>
          <SaveClass aulaSalvar={aulaSalvar} Salvar={Salvar} />
          <View>
            <AHighlighter
              style={[styles.text, {color: colors.text}]}
              highlight={{color: '#637aff'}}
              wordHighlight={txtToHighlight}
              text={txt}
              defaultSize={textSize}
            />
            <AHighlighter
              style={[styles[Textadd], {color: colors.text}]}
              highlight={{color: '#637aff'}}
              wordHighlight={txtToHighlight}
              text={adicionaltxt}
              defaultSize={textSize}
            />
            <AHighlighter
              style={[styles[Textadd2], {color: colors.text}]}
              highlight={{color: '#637aff'}}
              wordHighlight={txtToHighlight}
              text={adicionaltxt2}
              defaultSize={textSize}
            />
            <View /*Code visualizer section*/>
              <View
                style={
                  isContentVisible ? {flexDirection: 'row'} : {display: 'none'}
                }>
                <Pressable
                  style={
                    isIndexVisible
                      ? styles.button
                      : [styles.button, {backgroundColor: 'green'}]
                  }
                  onPress={toggleContent}>
                  <Text style={styles.text}>Index</Text>
                </Pressable>
                <Pressable
                  style={
                    isIndexVisible
                      ? [styles.button, {backgroundColor: 'green'}]
                      : styles.button
                  }
                  onPress={toggleContent}>
                  <Text style={styles.text}>Web</Text>
                </Pressable>
              </View>
              <View
                style={{alignItems: 'center', height: '70%'}} /*Code section*/
              >
                {isIndexVisible && isContentVisible ? (
                  <View style={styles.codeArea}>
                    <ASyntaxHighlighter
                      language="HTML"
                      style={currentTheme ? atomOneDark : atomOneLight}
                      code={`<!DOCTYPE html>
<html>
  <head>
    <title>Minha página</title>
  </head>
  <body>
    <h1>Minha página</h1>
    <p>Esta é a minha primeira página HTML!</p>
  </body>
</html>`}
                    />
                  </View>
                ) : (
                  <View>
                    <Image
                      style={styles[Imgadd]}
                      source={require('../../assets/Button.png')}
                    />
                  </View>
                )}
              </View>
            </View>
            <Text>teste</Text>
            <AHighlighter //Bottom text section
              style={[styles[Textadd3], {color: colors.text}]}
              highlight={{color: '#637aff'}}
              wordHighlight={txtToHighlight}
              text={adicionaltxt_end}
              defaultSize={textSize}
            />
          </View>
        </ScrollView>
      </View>
      <OpButton
        theme={'nextButton'}
        title={t('next')}
        onPressFunction={() => navigation.navigate('Home')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#0E151C',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Roboto',
  },
  TextInvisible: {
    display: 'none',
  },
  Imgadd: {
    display: 'none',
  },
  progressBar: {
    top: -2,
    height: 8,
    width: '100%',
    backgroundColor: 'white',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    width: '20%',
    // height: '20%',
  },
  figure: {
    margin: 10,
    width: 230,
    height: 203,
  },
  codeArea: {
    // height: '100%',
    width: '96%',
  },
});
