import React, {useState, useReducer} from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import Icon, {Icons} from '../components/Icons';
import OpButton from '../components/Shared/OpButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import AText from '../components/Shared/AText';

const textSize = 30;

const db = SQLite.openDatabase(
  {
    name: 'Users.db',
    location: 'default',
  },
  () => {},
  error => {
    console.log(error);
  },
);

export default function DependaTest({navigation}) {
  //Constante de tradução, usar {t("CHAVE")} para tradução
  const {t, i18n} = useTranslation();

  const {colors} = useTheme(); //Cores do tema

  const [talk, setTalk] = useState('');
  const [Dependa, setDependa] = useState('');
  const [UserId, setUserId] = useState('');
  const [XP, setXP] = useState(0);
  const [CView, setCoins] = useState(0);
  const [XPganho, setXPganho] = useState(0);
  const [reducerValue, forceUpdate] = useReducer(x => x + 1, 0);
  var Coins = 0;

  useFocusEffect(
    React.useCallback(() => {
      var randomNumber = Math.floor(Math.random() * 3) + 1;

      if (randomNumber == 1) {
        setTalk(t('congratulations'));
        Coins = 100;
      } else if (randomNumber == 2) {
        setTalk(t('keep it up'));
        Coins = 100;
      } else if (randomNumber == 3) {
        setTalk(t('you were amazing'));
        Coins = 100;
      }
      getUser();
    }, []),
  );

  const getUser = async () => {
    setCoins(Coins);
    const storageUser = await AsyncStorage.getItem('IdUser');
    const storageDependa = await AsyncStorage.getItem('DependaBots');
    const storageXP = await AsyncStorage.getItem('XP');
    const storageTimeDouble = await AsyncStorage.getItem('Double');
    const storageXPDouble = await AsyncStorage.getItem('XPDouble');
    let multiplicador = 1;
    if (storageXPDouble == '1') multiplicador = 2;
    setXPganho(20 * multiplicador);
    setXP(parseInt(storageXP) + 20 * multiplicador);
    setUserId(storageUser);
    setDependa(parseInt(storageDependa) + Coins);
  };

  const setData = async () => {
    await db.transaction(async tx => {
      await tx.executeSql(
        'UPDATE Users SET DependaBots=?, XP=? WHERE ID = ?;',
        [Dependa, XP, UserId],
      );
      await AsyncStorage.setItem('DependaBots', JSON.stringify(Dependa));
      await AsyncStorage.setItem('XP', JSON.stringify(XP));
      forceUpdate();
      navigation.navigate('Tester');
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View>
        <TouchableOpacity onPress={() => setData()}>
          <Icon
            type={Icons.Ionicons}
            name="ios-close-outline"
            color={'#33526E'}
            size={60}
            style={styles.icon}
          />
        </TouchableOpacity>
        <View>
          <AText
            style={[styles.text, {color: colors.text}]}
            defaultSize={textSize}>
            {talk}
          </AText>
          <AText
            style={[styles.text2, {color: colors.text}]}
            defaultSize={textSize}>
            +{CView} DependaBots
          </AText>
          <AText
            style={[styles.text2, {color: colors.text}]}
            defaultSize={textSize}>
            +{XPganho} XP
          </AText>
        </View>
        <Image
          style={styles.figure}
          source={require('../../assets/Robo_advanced.png')}
        />
      </View>
      <OpButton
        theme={'nextButton'}
        title={t('back')}
        onPressFunction={() => setData()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#0E151C',
  },
  box: {
    marginLeft: '1.5%',
    marginTop: 5,
    backgroundColor: '#141f29',
    borderColor: 'rgba(99, 122, 255, 0.2)',
    height: '92%',
    width: '97%',
  },
  text: {
    margin: 20,
    flexGrow: 1,
    fontFamily: 'Roboto',
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 20,
    top: 10,
  },
  text2: {
    marginLeft: 20,
    flexGrow: 1,
    fontFamily: 'Roboto',
    color: '#637aff',
    fontSize: 25,
    fontWeight: 'bold',
  },
  figure: {
    top: -130,
    left: -180,
    width: 720,
    height: 720,
  },
});
