import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { TextInput } from 'react-native-paper';
import Icon, { Icons } from '../Icons';
import Timer from './Timer';
import OpButton from './OpButton';
import AText from './AText';
import SaveClass from './SaveClass';
import AHighlighter from './AHighlighter';
import { TutorialText } from './Tutorials';
import { useContext } from 'react';
import { AppContext } from '../../common/Contexts/AppContext';
import { CustomDarkMode } from '../../common/Themes/DefaultThemes';

const textSize = 23;
const optSize = 20;

const windowHeight = Dimensions.get('window').height;

export default function TextView({
  navigation,
  progresso,
  sec,
  adicionaltxt,
  pergunta,
  txtantes,
  txtdepois,
  txtCerto1,
  txtCerto2,
  txtCerto3,
  tamanhoInput,
  navegar,
  aulaSalvar,
  Salvar,
  txtToHighlight = [''],
  tutorialVisible = false,
}) {
  //Constante de tradução, usar {t("CHAVE")} para tradução
  const { t, i18n } = useTranslation();

  const { colors } = useTheme(); //Variavel de cor do tema

  const { theme } = useContext(AppContext);

  //Define tutorial visivel
  const [TutorialVisible, setTutorialVisible] = useState(tutorialVisible);

  const [visibleModal, setVisibleModal] = useState('false');
  const [visibleModalE, setVisibleModalE] = useState('false');
  const [Textadd, setTextadd] = useState('Textadd');
  const [InputText, setInputText] = useState('');
  const [TEXTO, setTEXTO] = useState('');

  useEffect(() => {
    if (adicionaltxt != 'none') setTextadd('text');
  }, [adicionaltxt]);

  const Verificar = () => {
    setTEXTO(InputText);
    if (
      InputText == txtCerto1 ||
      InputText == txtCerto2 ||
      InputText == txtCerto3
    )
      setVisibleModal(true);
    else setVisibleModalE(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ScrollView style={styles.scroller}>
          <View style={[styles.progressBar, { backgroundColor: theme == CustomDarkMode ? '#273f55' : '#c1c1c1' }]} /*Progress Bar*/>
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: '#637aff', width: progresso },
              ]}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={{ width: 60 }}>
              <Icon
                type={Icons.Ionicons}
                name="ios-close-outline"
                color={'#33526E'}
                size={60}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTutorialVisible(!TutorialVisible)}
              style={{ width: 50, top: 8, marginLeft: '72%' }}>
              <Icon
                type={Icons.Ionicons}
                name="help-circle-outline"
                color={'#33526E'}
                size={45}
              />
            </TouchableOpacity>
          </View>
          <TutorialText visible={TutorialVisible} setModalVisible={setTutorialVisible} />
          <SaveClass AulaId={aulaSalvar} Salvar={Salvar} />
          <Timer navigation={navigation} seconds={sec} />
          <AHighlighter
            style={[styles[Textadd], { color: colors.text }]}
            highlight={{ color: '#637aff' }}
            wordHighlight={txtToHighlight}
            text={adicionaltxt}
            defaultSize={textSize}
          />
          <AHighlighter
            style={[styles.text, { color: colors.text }]}
            highlight={{ color: '#637aff' }}
            wordHighlight={txtToHighlight}
            text={pergunta}
            defaultSize={textSize}
          />
          <View style={[styles.txtarea, { backgroundColor: colors.primary }]}>
            <Text style={[styles.textopt, { color: colors.text }]}>
              {txtantes}
            </Text>
            <TextInput
              style={[styles.input, { width: tamanhoInput }]}
              onChangeText={value => setInputText(value)}></TextInput>
            <Text style={[styles.textopt, { color: colors.text }]}>
              {txtdepois}
            </Text>
          </View>
        </ScrollView>
        <OpButton
          theme={'nextButton'}
          title={t('verify')}
          onPressFunction={() => Verificar()}
        />

        <Modal visible={visibleModal} transparent={true}>
          <SafeAreaView>
            <View style={[styles.modalPopup, { backgroundColor: colors.card }]}>
              <AText
                style={[styles.textModal, { color: colors.text }]}
                defaultSize={textSize}>
                {t('congrats')}
              </AText>
              <OpButton
                theme={'modalButton'}
                title={t('continue')}
                onPressFunction={() => navigation.navigate(navegar)}
              />
            </View>
          </SafeAreaView>
        </Modal>
        <Modal visible={visibleModalE} transparent={true}>
          <SafeAreaView>
            <View style={[styles.modalPopup, { backgroundColor: colors.card }]}>
              <AText
                style={[styles.textModal, { color: colors.text }]}
                defaultSize={textSize}>
                {t('oh no')}
              </AText>
              <OpButton
                theme={'modalButtonE'}
                title={t('try again')}
                onPressFunction={() => setVisibleModalE(false)}
              />
            </View>
          </SafeAreaView>
        </Modal>
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
  scroller: {
    marginBottom: '25%',
  },
  modalPopup: {
    zIndex: 99,
    padding: 20,
    justifyContent: 'center',
    position: "absolute",
    width: "100%",
    top: windowHeight * (80 / 100),
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
    backgroundColor: '#273f55',
  },
  txtarea: {
    backgroundColor: '#141f29',
    width: '100%',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexDirection: 'row',
  },
  textopt: {
    margin: 9,
    flexGrow: 1,
    fontFamily: 'Roboto',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 30,
    borderRadius: -20,
  },
});
