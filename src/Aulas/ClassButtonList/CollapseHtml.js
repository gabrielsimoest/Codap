import React, {useState} from 'react';
import {Image, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Collapsible from 'react-native-collapsible';
import OpButton from '../../components/Shared/OpButton';
import {
  useFocusEffect,
  useNavigation,
  useTheme,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AText from '../../components/Shared/AText';
import {useTranslation} from 'react-i18next';

const TitleTextSize = 23;
const textSize = 15;

export default function CollapseHtml() {
  //Salvar aulas
  const [AulasSalvas, setAulasSalvas] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      getUser();
    }, []),
  );

  const getUser = async () => {
    const storageAulasSalvas = await AsyncStorage.getItem('Aulas');
    setAulasSalvas(storageAulasSalvas);
  };

  //Constante de tradução, usar {t("CHAVE")} para tradução
  const {t, i18n} = useTranslation();

  const {colors} = useTheme(); //Cores do tema

  const navigation = useNavigation();

  var [collapsed1, setState] = useState(true);
  var [collapsed2, setState2] = useState(true);
  var [collapsed3, setState3] = useState(true);
  var [collapsed4, setState4] = useState(true);

  var toggleExpanded = () => {
    setState((collapsed1 = !collapsed1));
  };
  var toggleExpanded2 = () => {
    setState2((collapsed2 = !collapsed2));
  };
  var toggleExpanded3 = () => {
    setState3((collapsed3 = !collapsed3));
  };
  var toggleExpanded4 = () => {
    setState4((collapsed4 = !collapsed4));
  };
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <TouchableOpacity
        onPress={toggleExpanded}
        style={[styles.class, {backgroundColor: colors.primary}]}>
        <AText
          style={[styles.title, {color: colors.text}]}
          defaultSize={TitleTextSize}>
          {t('module1h')}
        </AText>
        <AText
          style={[styles.text, {color: colors.text}]}
          defaultSize={textSize}>
          {t('concepts of html')}
        </AText>
        <Image
          style={styles.figure}
          source={require('../../../assets/Robo_basics.png')}
        />
      </TouchableOpacity>
      <Collapsible collapsed={collapsed1}>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={13}
            theme={'classButton'}
            title={t('Discovering HTML and Tags')}
            onPressFunction={() => navigation.navigate('Estrutura')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={14}
            theme={'classButton'}
            title={t('Estructuring titles')}
            onPressFunction={() => navigation.navigate('Header')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={12}
            theme={'classButton'}
            title={t('Creating phrases')}
            onPressFunction={() => navigation.navigate('Frases')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={10}
            theme={'classButton'}
            title={t('Creating buttons')}
            onPressFunction={() => navigation.navigate('ButtonHtml')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={9}
            theme={'classButton'}
            title={t('Adding image')}
            onPressFunction={() => navigation.navigate('ImgTeoric')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={11}
            theme={'classButton'}
            title={t('Adding comment')}
            onPressFunction={() => navigation.navigate('Comentario')}
          />
        </View>
        <View style={[styles.line, {borderColor: colors.primary}]}></View>
      </Collapsible>
      <TouchableOpacity
        onPress={toggleExpanded2}
        style={[styles.class, {backgroundColor: colors.primary}]}>
        <AText
          style={[styles.title, {color: colors.text}]}
          defaultSize={TitleTextSize}>
          {t('module2h')}
        </AText>
        <AText
          style={[styles.text, {color: colors.text}]}
          defaultSize={textSize}>
          {t('intermediate html')}
        </AText>
        <Image
          style={styles.figure2}
          source={require('../../../assets/Robo_inter.png')}
        />
      </TouchableOpacity>
      <Collapsible collapsed={collapsed2}>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={18}
            theme={'classButton'}
            title={t('Data elements')}
            onPressFunction={() => navigation.navigate('Head')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={16}
            theme={'classButton'}
            title={t('Making a body')}
            onPressFunction={() => navigation.navigate('Body')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={15}
            theme={'classButton'}
            title={t('Making lists')}
            onPressFunction={() => navigation.navigate('Listas')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={14}
            theme={'classButton'}
            title={t('Making links')}
            onPressFunction={() => navigation.navigate('Links')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={17}
            theme={'classButton'}
            title={t('Generic sections, lines and space')}
            onPressFunction={() => navigation.navigate('Div')}
          />
        </View>
        <View style={[styles.line, {borderColor: colors.primary}]}></View>
      </Collapsible>
      <TouchableOpacity
        onPress={toggleExpanded3}
        style={[styles.class, {backgroundColor: colors.primary}]}>
        <AText
          style={[styles.title, {color: colors.text}]}
          defaultSize={TitleTextSize}>
          {t('module3h')}
        </AText>
        <AText
          style={[styles.text, {color: colors.text}]}
          defaultSize={textSize}>
          {t('advanced html')}
        </AText>
        <Image
          style={styles.figure3}
          source={require('../../../assets/Robo_advanced.png')}
        />
      </TouchableOpacity>
      <Collapsible collapsed={collapsed3}>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={21}
            theme={'classButton'}
            title={t('Identifying elements')}
            onPressFunction={() => navigation.navigate('IndentTeoric')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={22}
            theme={'classButton'}
            title={t('Table introduction')}
            onPressFunction={() => navigation.navigate('ITableTeoric')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={20}
            theme={'classButton'}
            title={t('Creating data')}
            onPressFunction={() => navigation.navigate('CriandoDados')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={19}
            theme={'classButton'}
            title={t('Adding line')}
            onPressFunction={() => navigation.navigate('AdicionandoLinhas')}
          />
        </View>
        <View style={[styles.line, {borderColor: colors.primary}]}></View>
      </Collapsible>
      <TouchableOpacity
        onPress={toggleExpanded4}
        style={[styles.class, {backgroundColor: colors.primary}]}>
        <AText
          style={[styles.title, {color: colors.text}]}
          defaultSize={TitleTextSize}>
          {t('module4h')}
        </AText>
        <AText
          style={[styles.text, {color: colors.text}]}
          defaultSize={textSize}>
          {t('mastery in html')}
        </AText>
        <Image
          style={styles.figure3}
          source={require('../../../assets/Robo_master.png')}
        />
      </TouchableOpacity>
      <Collapsible collapsed={collapsed4}>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={24}
            theme={'classButton'}
            title={t('Adding data')}
            onPressFunction={() => navigation.navigate('AdicionandoDados')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={27}
            theme={'classButton'}
            title={t('Data types2')}
            onPressFunction={() => navigation.navigate('TiposDeDados')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={26}
            theme={'classButton'}
            title={t('Selecting data')}
            onPressFunction={() => navigation.navigate('SelecionandoDados')}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <OpButton
            AulasSalvarOp={AulasSalvas}
            Verify={25}
            theme={'classButton'}
            title={t('Showing videos')}
            onPressFunction={() => navigation.navigate('MostrandoVideos')}
          />
        </View>
        <View style={[styles.line, {borderColor: colors.primary}]}></View>
      </Collapsible>
    </View>
  );
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
    marginRight: 15,
  },
});
