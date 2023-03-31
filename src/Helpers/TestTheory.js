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
              <View style={{flexDirection: 'row'}}>
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
              <View style={{backgroundColor: 'white'}}>
                {/*Start code view*/}
                {isIndexVisible ? (
                  <View style={{width: '96%', marginLeft: '2%'}}>
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
    <p>Esta é a minha primeira página HTML!</p>
    <p>Esta é a minha primeira página HTML!</p>
    <p>Esta é a minha primeira página HTML!</p>
  </body>
</html>`}
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
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    width: '20%',
  },
  figure: {
    margin: 10,
    width: 230,
    height: 203,
  },
  codeArea: {
    width: '96%',
  },
});
