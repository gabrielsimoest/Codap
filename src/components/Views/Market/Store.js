import React, { useEffect, useReducer, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import HeaderShop from '../../HeaderShop';
import OpButton from '../../Shared/OpButton';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Iconis from 'react-native-vector-icons/Octicons';
import Icon, { Icons } from '../../Icons';
import SQLite from 'react-native-sqlite-storage';
import { useTheme } from '@react-navigation/native';
import AText from '../../Shared/AText';
import { useTranslation } from 'react-i18next';

const size1 = 20;
const size2 = 23;
const size3 = 30;

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

export default function Store() {
  //Constante de tradução, usar {t("CHAVE")} para tradução
  const { t, i18n } = useTranslation();

  const { colors } = useTheme(); //Variavel de cor do tema

  const [reducerValue, forceUpdate] = useReducer(x => x + 1, 0);
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleModal2, setVisibleModal2] = useState(false);
  const [visibleModal3, setVisibleModal3] = useState(false);
  const [visibleModal4, setVisibleModal4] = useState(false);
  const [visibleModal5, setVisibleModal5] = useState(false);
  const [UserId, setUserId] = useState('');
  const [Dependa, setDependa] = useState('');
  const [XP, setXP] = useState('');
  const [Double, setDouble] = useState('');
  const [XpDoubleBool, setXpDoubleBool] = useState('0');
  const [XpAtivo, setXpAtivo] = useState(t("inactive"));

  useFocusEffect(
    React.useCallback(() => {
      getUser();
    }, [reducerValue]),
  );
  useEffect(() => {
    if (XpDoubleBool == '0' || XpDoubleBool == null) setXpAtivo(t("inactive"));
    if (XpDoubleBool == '1') setXpAtivo(t("active"));
  }, [XpDoubleBool, t]);

  const getUser = async () => {
    const storageDependa = await AsyncStorage.getItem('DependaBots');
    const storageXP = await AsyncStorage.getItem('XP');
    const storageUser = await AsyncStorage.getItem('IdUser');
    const storageDouble = await AsyncStorage.getItem('Double');
    const storageXPDouble = await AsyncStorage.getItem('XPDouble');
    setXP(storageXP);
    setUserId(storageUser);
    setDouble(parseInt(storageDouble) + 1);
    setDependa(storageDependa);
    setXpDoubleBool(storageXPDouble);
  };

  var DoubleCoins = Dependa;

  async function DoubleF() {
    await db.transaction(async tx => {
      await tx.executeSql(
        'UPDATE Users SET Double=?, DependaBots=? WHERE ID = ?;',
        [Double, DoubleCoins, UserId],
      );
      await AsyncStorage.setItem('Double', JSON.stringify(Double));
      await AsyncStorage.setItem('DependaBots', JSON.stringify(DoubleCoins));
      forceUpdate();
    });
  }
  async function DoubleX() {
    await db.transaction(async tx => {
      await tx.executeSql('UPDATE Users SET DependaBots=? WHERE ID = ?;', [
        DoubleCoins,
        UserId,
      ]);
      await AsyncStorage.setItem('XPDouble', '1');
      await AsyncStorage.setItem('DependaBots', JSON.stringify(DoubleCoins));
      setXpAtivo('Ativo');
      setTimeout(forceUpdate, 2000);
      setTimeout(async function () {
        await AsyncStorage.setItem('XPDouble', '0');
        alert('Dobro de Experiencia Desativado');/////////////////////////////
        setXpAtivo(t('inactive'));
        setTimeout(forceUpdate, 2000);
      }, 300000);
    });
  }

  const sendXP = async () => {
    if (Dependa > 200) {
      DoubleCoins = DoubleCoins - 200;
      DoubleX();
    } else {
      alert('DependaBots Insuficientes');/////////////////////////////
    }
  };

  const sendChest = async () => {
    if (Dependa > 500) {
      DoubleCoins = DoubleCoins - 500;
      await db.transaction(async tx => {
        await tx.executeSql('UPDATE Users SET DependaBots=? WHERE ID = ?;', [
          DoubleCoins,
          UserId,
        ]);
        await AsyncStorage.setItem('DependaBots', JSON.stringify(DoubleCoins));

        var randomNumber = Math.floor(Math.random() * 2) + 1;

        if (randomNumber == 1) {
          setVisibleModal2(false);
          setVisibleModal5(true);
          DoubleF();
        }
        if (randomNumber == 2) {
          setVisibleModal2(false);
          setVisibleModal4(true);
          DoubleX();
        }

        forceUpdate();
      });
    } else {
      alert('DependaBots Insuficientes');/////////////////////////////
    }
  };

  const sendDouble = async () => {
    if (Dependa > 300) {
      DoubleCoins = DoubleCoins - 300;
      DoubleF();
    } else {
      alert('DependaBots Insuficientes');/////////////////////////////
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderShop dependa={Dependa} />
      <Text style={[styles.headert, { color: colors.text }]}>
        {t('buy using dependabots')}
      </Text>
      <ScrollView style={{ marginBottom: '18.2%' }}>
        <View style={[styles.list, { backgroundColor: colors.primary }]}>
          <Text style={[styles.Double, { color: colors.text }]}>{XpAtivo}</Text>
          <Image
            style={styles.xpImage}
            source={require('../../../../assets/Dobro_XP.png')}
          />
          <AText
            style={[styles.textL, { color: colors.text }]}
            defaultSize={size1}>
            {t('double experience')}
          </AText>
          <AText
            style={[styles.textLD, { color: colors.text }]}
            defaultSize={size1}>
            200 <Iconis name="dependabot" size={21} color={colors.text} />
          </AText>
          <View style={styles.button}>
            <OpButton
              theme={'marketButton'}
              title={t('buy')}
              onPressFunction={() => setVisibleModal(true)}
            />
          </View>
        </View>
        <View style={[styles.list, { backgroundColor: colors.primary }]}>
          <AText
            style={[styles.textL2, { color: colors.text }]}
            defaultSize={size1}>
            {t('surprise chest')}
          </AText>
          <AText
            style={[styles.textLD2, { color: colors.text }]}
            defaultSize={size1}>
            <Iconis name="dependabot" size={21} color={colors.text} /> 500
          </AText>
          <Image
            style={styles.chestImage}
            source={require('../../../../assets/Bau_surpresa.png')}
          />
          <OpButton
            theme={'marketButton2'}
            title={t('buy')}
            onPressFunction={() => setVisibleModal2(true)}
          />
        </View>
        <View style={[styles.list, { backgroundColor: colors.primary }]}>
          <Text style={[styles.Double, { color: colors.text }]}>
            {Double - 1}
          </Text>
          <Image
            style={styles.timeImage}
            source={require('../../../../assets/Dobro_Tempo.png')}
          />
          <AText
            style={[styles.textL, { color: colors.text }]}
            defaultSize={size1}>
            {t('double time')}
          </AText>
          <AText
            style={[styles.textLD3, { color: colors.text }]}
            defaultSize={size1}>
            300 <Iconis name="dependabot" size={21} color={colors.text} />
          </AText>
          <View style={styles.button}>
            <OpButton
              theme={'marketButton'}
              title={t('buy')}
              onPressFunction={() => setVisibleModal3(true)}
            />
          </View>
        </View>

        <Modal animationType="fade" visible={visibleModal} transparent={true}>
          <SafeAreaView style={styles.centeredView}>
            <View
              style={[styles.contant, { backgroundColor: colors.background }]}>
              <TouchableOpacity onPress={() => setVisibleModal(false)}>
                <Icon
                  type={Icons.Ionicons}
                  name="ios-close-outline"
                  color={'#33526E'}
                  size={60}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <AText
                style={[styles.textModal, { color: colors.text }]}
                defaultSize={size2}>
                {t('buy double experience')}
              </AText>
              <Image
                style={styles.xpImageModal}
                source={require('../../../../assets/Dobro_XP.png')}
              />
              <AText
                style={[styles.text, { color: colors.text }]}
                defaultSize={size3}>
                200 <Iconis name="dependabot" size={30} color={colors.text} />
              </AText>
              <OpButton
                theme={'modalButtonStore'}
                title={t('buy')}
                onPressFunction={() => sendXP()}
              />
            </View>
          </SafeAreaView>
        </Modal>
        <Modal animationType="fade" visible={visibleModal2} transparent={true}>
          <SafeAreaView style={styles.centeredView}>
            <View
              style={[styles.contant, { backgroundColor: colors.background }]}>
              <TouchableOpacity onPress={() => setVisibleModal2(false)}>
                <Icon
                  type={Icons.Ionicons}
                  name="ios-close-outline"
                  color={'#33526E'}
                  size={60}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <AText
                style={[styles.textModal, { color: colors.text }]}
                defaultSize={size2}>
                {t('buy surprise chest')}
              </AText>
              <Image
                style={styles.chestImageModal}
                source={require('../../../../assets/Bau_surpresa.png')}
              />
              <AText
                style={[styles.text, { color: colors.text }]}
                defaultSize={size3}>
                500 <Iconis name="dependabot" size={30} color={colors.text} />
              </AText>
              <OpButton
                theme={'modalButtonStore'}
                title={t('buy')}
                onPressFunction={() => sendChest()}
              />
            </View>
          </SafeAreaView>
        </Modal>
        <Modal animationType="fade" visible={visibleModal3} transparent={true}>
          <SafeAreaView style={styles.centeredView}>
            <View
              style={[styles.contant, { backgroundColor: colors.background }]}>
              <TouchableOpacity onPress={() => setVisibleModal3(false)}>
                <Icon
                  type={Icons.Ionicons}
                  name="ios-close-outline"
                  color={'#33526E'}
                  size={60}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <AText
                style={[styles.textModal, { color: colors.text }]}
                defaultSize={size2}>
                {t('buy double time')}
              </AText>
              <Image
                style={styles.timeImageModal}
                source={require('../../../../assets/Dobro_Tempo.png')}
              />
              <AText
                style={[styles.text, { color: colors.text }]}
                defaultSize={size3}>
                300 <Iconis name="dependabot" size={30} color={colors.text} />
              </AText>
              <OpButton
                theme={'modalButtonStore'}
                title={t('buy')}
                onPressFunction={() => sendDouble()}
              />
            </View>
          </SafeAreaView>
        </Modal>

        <Modal animationType="fade" visible={visibleModal4} transparent={true}>
          <SafeAreaView style={styles.centeredView}>
            <View
              style={[styles.contant, { backgroundColor: colors.background }]}>
              <TouchableOpacity onPress={() => setVisibleModal4(false)}>
                <Icon
                  type={Icons.Ionicons}
                  name="ios-close-outline"
                  color={'#33526E'}
                  size={60}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <AText
                style={[styles.textModal, { color: colors.text }]}
                defaultSize={size2}>
                {t('you have double experience')}
              </AText>
              <Image
                style={styles.xpImageModal}
                source={require('../../../../assets/Dobro_XP.png')}
              />
              <OpButton
                theme={'modalButtonStore'}
                title={t('close')}
                onPressFunction={() => setVisibleModal4(false)}
              />
            </View>
          </SafeAreaView>
        </Modal>

        <Modal animationType="fade" visible={visibleModal5} transparent={true}>
          <SafeAreaView style={styles.centeredView}>
            <View
              style={[styles.contant, { backgroundColor: colors.background }]}>
              <TouchableOpacity onPress={() => setVisibleModal5(false)}>
                <Icon
                  type={Icons.Ionicons}
                  name="ios-close-outline"
                  color={'#33526E'}
                  size={60}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <AText
                style={[styles.textModal, { color: colors.text }]}
                defaultSize={size2}>
                {t('you have double time')}
              </AText>
              <Image
                style={styles.timeImageModal}
                source={require('../../../../assets/Dobro_Tempo.png')}
              />
              <OpButton
                theme={'modalButtonStore'}
                title={t('close')}
                onPressFunction={() => setVisibleModal5(false)}
              />
            </View>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141f29',
    height: '100%',
  },
  headert: {
    margin: 10,
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  list: {
    backgroundColor: '#1B2B39',
    borderRadius: 10,
    height: 170,
    margin: 10,
    elevation: 7,
  },
  button: {
    left: '8%',
    top: '25%',
  },
  xpImage: {
    top: 30,
    margin: 5,
    width: 150,
    height: 120,
  },
  chestImage: {
    position: 'absolute',
    right: -5,
    bottom: 0,
    width: 180,
    height: 180,
  },
  timeImage: {
    top: 15,
    margin: 5,
    width: 160,
    height: 130,
  },
  textL: {
    color: '#fff',
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    right: 37,
    top: 10,
  },
  textL2: {
    color: '#fff',
    fontWeight: 'bold',
    position: 'absolute',
    fontFamily: 'Roboto',
    fontSize: 20,
    left: 35,
    top: 10,
  },
  textL3: {
    color: '#fff',
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    right: 60,
    top: 38,
  },
  textLD: {
    color: '#637aff',
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    right: 40,
    top: 38,
  },
  textLD2: {
    color: '#637aff',
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    left: 35,
    top: 38,
  },
  textLD3: {
    color: '#637aff',
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    right: 40,
    top: 38,
  },
  contant: {
    opacity: 0.99,
    margin: 20,
    marginTop: 130,
    zIndex: 99,
    padding: 20,
    borderRadius: 30,
    borderColor: 'rgba(0,0,0, 0.2)',
    backgroundColor: '#141f29',

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
    marginTop: -40,
  },
  xpImageModal: {
    right: 70,
    margin: 10,
    width: 265,
    height: 220,
    marginLeft: '28%',
  },
  chestImageModal: {
    right: 30,
    width: 350,
    height: 350,
    margin: 10,
  },
  timeImageModal: {
    right: 70,
    margin: 10,
    width: 265,
    height: 220,
    marginLeft: '28%',
  },
  icon: {
    marginLeft: 260,
    top: -15,
  },
  text: {
    flexGrow: 1,
    fontFamily: 'Roboto',
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: '35%',
  },
  Double: {
    position: 'absolute',
    top: '3%',
    left: '4%',
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
});
