import {useTheme} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  ScrollView,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import Icon, {Icons} from '../components/Icons';
import OpButton from '../Helpers/OpButton';
import AText from '../Helpers/AText';
import AHighlighter from '../Helpers/AHighlighter';
import CodeEditor, {
  CodeEditorSyntaxStyles,
} from '@rivascva/react-native-code-editor';

const textSize = 23;
const optSize = 20;

export default function TesteCode({
  navigation,
  progresso,
  adicionaltxt = 'OI',
  pergunta = 'OI',
  txtCerto1 = 'function myFunction() {\n  return "Hello World!";\n}',
  navegar = 'Home',
  txtToHighlight = [''],
}) {
  //Constante de tradução, usar {t("CHAVE")} para tradução
  const {t, i18n} = useTranslation();

  const {colors} = useTheme(); //Variavel de cor do tema

  const [visibleModal, setVisibleModal] = useState('false');
  const [visibleModalE, setVisibleModalE] = useState('false');
  const [Textadd, setTextadd] = useState('Textadd');

  useEffect(() => {
    if (adicionaltxt != 'none') setTextadd('text');
  }, []);

  const [code, setCode] = useState('function myFunction() {\n  \n}');

  const Verificar = () => {
    setCode(code);
    if (code == txtCerto1) setVisibleModal(true);
    else setVisibleModalE(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, {backgroundColor: colors.card}]}>
        <View>
          <View style={styles.progressBar}>
            <View
              style={[
                StyleSheet.absoluteFill,
                {backgroundColor: '#637aff', width: progresso},
              ]}
            />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon
              type={Icons.Ionicons}
              name="ios-close-outline"
              color={'#33526E'}
              size={60}
              style={styles.icon}
            />
          </TouchableOpacity>
          <AHighlighter
            style={[styles[Textadd], {color: colors.text}]}
            highlight={{color: '#637aff'}}
            wordHighlight={txtToHighlight}
            text={adicionaltxt}
            defaultSize={textSize}
          />
          <AHighlighter
            style={[styles.text, {color: colors.text}]}
            highlight={{color: '#637aff'}}
            wordHighlight={txtToHighlight}
            text={pergunta}
            defaultSize={textSize}
          />
        </View>
        <View style={styles.codeArea}>
          <CodeEditor
            style={{
              fontSize: 20,
              inputLineHeight: 26,
              highlighterLineHeight: 26,
            }}
            language="javascript"
            initialValue={code}
            onChange={setCode}
            syntaxStyle={CodeEditorSyntaxStyles.atomOneDark}
            showLineNumbers
            autoFocus={false}
          />
        </View>
        <View style={styles.buttonContainer}>
          <OpButton
            theme={'nextButton'}
            title={t('verify')}
            onPressFunction={() => Verificar()}
          />

          <Modal visible={visibleModal} transparent={true}>
            <View style={[styles.modalPopup, {backgroundColor: colors.card}]}>
              <AText
                style={[styles.textModal, {color: colors.text}]}
                defaultSize={textSize}>
                {t('congrats')}
              </AText>
              <OpButton
                theme={'modalButton'}
                title={t('continue')}
                onPressFunction={() => [
                  setVisibleModal(false),
                  navigation.navigate(navegar),
                ]}
              />
            </View>
          </Modal>
          <Modal visible={visibleModalE} transparent={true}>
            <View style={[styles.modalPopup, {backgroundColor: colors.card}]}>
              <AText
                style={[styles.textModal, {color: colors.text}]}
                defaultSize={textSize}>
                {t('oh no')}
              </AText>
              <OpButton
                theme={'modalButtonE'}
                title={t('try again')}
                onPressFunction={() => setVisibleModalE(false)}
              />
            </View>
          </Modal>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#0E151C',
  },
  text: {
    margin: 20,
    flexGrow: 1,
    fontFamily: 'Roboto',
    color: 'white',
    fontSize: 23,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 20,
    top: 10,
  },
  modalPopup: {
    // flex: 1,
    zIndex: 99,
    padding: 20,
    justifyContent: 'center',
    marginTop: '127%',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0, 0.2)',
    backgroundColor: '#0E151C',

    shadowColor: 'rgba(0,0,0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
    shadowOpacity: 0.28,
    shadowRadius: 4,
  },
  textModal: {
    flexGrow: 1,
    fontFamily: 'Roboto',
    color: 'white',
    fontSize: 23,
    fontWeight: 'bold',
  },
  Textadd: {
    display: 'none',
  },
  progressBar: {
    top: -2,
    height: 8,
    width: '100%',
    backgroundColor: 'white',
  },
  codeArea: {
    width: '100%',
    height: '40%',
    marginBottom: '11%',
  },
  buttonContainer: {
    height: '20%',
  },
});
