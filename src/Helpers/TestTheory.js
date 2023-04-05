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
import WebView from 'react-native-webview';

const textSize = 20;

export default function TestTheory({navigation}) {
  const {colors} = useTheme(); //Variavel de cor do tema

  let currentTheme = useSelector(state => {
    return state.myDarkMode;
  });

  const [OnlyCodeVisible, setCodeOnly] = useState(false);
  const [isIndexVisible, setIndexVisible] = useState(true);
  const toggleContent = () => {
    setIndexVisible(!isIndexVisible);
  };

  const [highlighterHeight, setHighlighterHeight] = useState(100);

  const onHighlighterLayout = event => {
    const {height} = event.nativeEvent.layout;
    setHighlighterHeight(height);
  };

  const html = `
  <html>
  <head>
    <title>Minha página</title>
  </head>
  <body>
    <h1>Minha página</h1>
    <p>Esta é a minha primeira página HTML!</p>
  </body>
</html>
  `;

  return (
    <View style={[styles.container, {backgroundColor: colors.card}]}>
      <View style={styles.progressBar} /*Progress Bar*/>
        <View
          style={[
            StyleSheet.absoluteFill,
            {backgroundColor: '#637aff', width: '100%'},
          ]}
        />
      </View>
      {/*BODY*/}
      <View style={[styles.container, {backgroundColor: colors.card}]}>
        <ScrollView style={{marginBottom: '20%'}}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon
              type={Icons.Ionicons}
              name="ios-close-outline"
              color={'#33526E'}
              size={60}
              style={styles.icon}
            />
          </TouchableOpacity>
          <Text style={[styles.text, {color: colors.text}]}>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </Text>
          <Text style={[styles.text, {color: colors.text}]}>TESTE</Text>
          <Text style={[styles.text, {color: colors.text}]}>TESTE</Text>

          {/*CODE SECTION*/}
          {OnlyCodeVisible ? (
            <View>
              <Text>OI</Text>
            </View>
          ) : (
            <View>
              <View style={{flexDirection: 'row', marginTop: '3%'}}>
                <Pressable
                  style={
                    isIndexVisible
                      ? currentTheme
                        ? styles.buttonIndex
                        : styles.LightButtonIndex
                      : currentTheme
                      ? styles.buttonIndex_deselected
                      : styles.LightButtonIndex_deselected
                  }
                  onPress={toggleContent}>
                  <Text style={[styles.text, {color: colors.text}]}>Index</Text>
                </Pressable>
                <Pressable
                  style={
                    isIndexVisible
                      ? currentTheme
                        ? styles.buttonWeb_deselected
                        : styles.LightButtonWeb_deselected
                      : currentTheme
                      ? styles.buttonWeb
                      : styles.LightButtonWeb
                  }
                  onPress={toggleContent}>
                  <Text style={[styles.text, {color: colors.text}]}>Web</Text>
                </Pressable>
              </View>
              <View
                style={[
                  currentTheme ? styles.codeArea : styles.codeAreaLight,
                  {
                    /*backgroundColor: 'white'*/
                  },
                ]}>
                {/*Start code view*/}
                {isIndexVisible ? (
                  <View style={{width: '100%'}} onLayout={onHighlighterLayout}>
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
                  <View style={{width: '100%', height: highlighterHeight}}>
                    <WebView
                      source={{html: html}}
                      containerStyle={{
                        flex: 0,
                        height: highlighterHeight,
                      }}
                      textZoom={200}
                      nestedScrollEnabled={true}
                    />
                  </View>
                )}
                {/*End code view*/}
              </View>
            </View>
          )}

          <Text style={[styles.text, {color: colors.text}]}>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </Text>
        </ScrollView>
        <View>
          <OpButton
            theme={'nextButton'}
            title={'next'}
            onPressFunction={() => navigation.navigate('Home')}
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
  text: {
    fontSize: 18,
    fontFamily: 'Roboto',
  },
  progressBar: {
    top: -2,
    height: 8,
    width: '100%',
    backgroundColor: 'white',
  },
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

  figure: {
    margin: 10,
    width: 230,
    height: 203,
  },
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
