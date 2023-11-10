import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import UniversalPicture from './UniversalPicture'
import Icon, { Icons } from '../Icons';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AText from './AText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/*******************Theory tutorial*******************************/
export const TutorialTheory = ({ visible, setModalVisible }) => {
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const { colors } = useTheme(); //Variavel de cor do tema

  const { t, i18n } = useTranslation();

  const tutorialData = [
    {
      title: 'tutorial.theory.tutorial title theory 1',
      text: 'tutorial.theory.tutorial theory 1',
      image: require('../../../assets/Robo_pensativo_centralizado.png'),
      content: "image",
    },
    {
      title: 'tutorial.theory.tutorial title theory 2',
      text: 'tutorial.theory.tutorial theory 2',
      image: require('../../../assets/Tutorial_code.gif'),
      content: "gif",
    },
    {
      title: 'tutorial.theory.tutorial title theory 3',
      text: 'tutorial.theory.tutorial theory 3',
      image: require('../../../assets/Tutorial_indexWeb.gif'),
      content: "gif",
    },
    {
      title: 'tutorial.theory.tutorial title theory 4',
      text: 'tutorial.theory.tutorial theory 4',
      image: require('../../../assets/Tutorial_indexWeb.gif'), //TODO:CORRIGIR Tutorial_web.gif //IMAGEM CERTA
      content: "gif",
    },
    {
      title: 'tutorial.common.tutorial title end',
      text: 'tutorial.common.tutorial end',
      image: require('../../../assets/Robo_feliz_centralizado.png'),
      content: "image",
    },
  ];

  const handleScroll = event => {
    const slideSize = screenWidth * 0.85;
    const { x } = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(x / slideSize);
    setActiveSlide(currentIndex);
  };

  const handleSnapToItem = index => {
    const slideSize = screenWidth * 0.85 - 7;
    setActiveSlide(index);
    scrollViewRef.current.scrollTo({
      x: index * slideSize,
      y: 0,
      animated: true,
    });
  };

  const onPressHandler = () => {
    setModalVisible(!visible);
    setActiveSlide(0)
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      >
      <View style={styles.modalBackground}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={() => onPressHandler()}
            style={styles.icon}>
            <Icon
              type={Icons.Ionicons}
              name="ios-close-outline"
              color={'#33526E'}
              size={30}
            />
          </TouchableOpacity>
          <ScrollView
            ref={scrollViewRef}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={styles.carouselContainer}>
            {tutorialData.map((item, index) => (
              <View key={index} style={styles.slide}>
                <AText style={[styles.title, { color: colors.text }]} defaultSize={24}>
                  {t(item.title)}
                </AText>
                <UniversalPicture content={item.content} source={item.image} style={styles.image}/>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={18}>
                  {t(item.text)}
                </AText>
              </View>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {tutorialData.map((item, index) => (
              <Text
                key={index}
                style={[
                  styles.paginationDot,
                  activeSlide === index && styles.paginationDotActive,
                ]}
                onPress={() => handleSnapToItem(index)}>
                ⬤
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

/*******************Option tutorial*******************************/
export const TutorialOption = ({ visible, setModalVisible }) => {
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const { colors } = useTheme(); //Variavel de cor do tema

  const { t, i18n } = useTranslation();

  const tutorialData = [
    {
      title: 'tutorial.option_exercise.option title 1',
      text: 'tutorial.option_exercise.option 1',
      image: require('../../../assets/Robo_pensativo_centralizado.png'),
      content: "image",
    },
    {
      title: 'tutorial.option_exercise.option title 2',
      text: 'tutorial.option_exercise.option 2',
      image: require('../../../assets/Tutorial_code.gif'),
      content: "gif",
    },
    {
      title: 'tutorial.option_exercise.option title 3',
      text: 'tutorial.option_exercise.option 3',
      image: require('../../../assets/Tutorial_indexWeb.gif'),
      content: "gif",
    },
    {
      title: 'tutorial.common.tutorial title timer',
      text: 'tutorial.common.tutorial timer',
      image: require('../../../assets/Tutorial_indexWeb.gif'), //TODO:CORRIGIR Tutorial_web.gif //IMAGEM CERTA
      content: "gif",
    },
    {
      title: 'tutorial.common.tutorial title end',
      text: 'tutorial.common.tutorial end',
      image: require('../../../assets/Robo_feliz_centralizado.png'),
      content: "image",
    },
  ];

  const handleScroll = event => {
    const slideSize = screenWidth * 0.85;
    const { x } = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(x / slideSize);
    setActiveSlide(currentIndex);
  };

  const handleSnapToItem = index => {
    const slideSize = screenWidth * 0.85 - 7;
    setActiveSlide(index);
    scrollViewRef.current.scrollTo({
      x: index * slideSize,
      y: 0,
      animated: true,
    });
  };

  const onPressHandler = () => {
    setModalVisible(!visible);
    setActiveSlide(0)
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      >
      <View style={styles.modalBackground}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={() => onPressHandler()}
            style={styles.icon}>
            <Icon
              type={Icons.Ionicons}
              name="ios-close-outline"
              color={'#33526E'}
              size={30}
            />
          </TouchableOpacity>
          <ScrollView
            ref={scrollViewRef}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={styles.carouselContainer}>
            {tutorialData.map((item, index) => (
              <View key={index} style={styles.slide}>
                <AText style={[styles.title, { color: colors.text }]} defaultSize={24}>
                  {t(item.title)}
                </AText>
                <UniversalPicture content={item.content} source={item.image} style={styles.image}/>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={18}>
                  {t(item.text)}
                </AText>
              </View>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {tutorialData.map((item, index) => (
              <Text
                key={index}
                style={[
                  styles.paginationDot,
                  activeSlide === index && styles.paginationDotActive,
                ]}
                onPress={() => handleSnapToItem(index)}>
                ⬤
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

/*******************Text tutorial*******************************/
export const TutorialText = ({ visible, setModalVisible }) => {
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const { colors } = useTheme(); //Variavel de cor do tema

  const { t, i18n } = useTranslation();

  const tutorialData = [
    {
      title: 'tutorial.text_exercise.text title 1',
      text: 'tutorial.text_exercise.text 1',
      image: require('../../../assets/Tutorial_indexWeb.gif'), //TODO:CORRIGIR Tutorial_web.gif //IMAGEM CERTA
      content: "gif",
    },
    {
      title: 'tutorial.text_exercise.text title 2',
      text: 'tutorial.text_exercise.text 2',
      image: require('../../../assets/Robo_pensativo_centralizado.png'),
      content: "image",
    },
    {
      title: 'tutorial.common.tutorial title timer',
      text: 'tutorial.common.tutorial timer',
      image: require('../../../assets/Tutorial_indexWeb.gif'), //TODO:CORRIGIR Tutorial_web.gif //IMAGEM CERTA
      content: "gif",
    },
    {
      title: 'tutorial.common.tutorial title end',
      text: 'tutorial.common.tutorial end',
      image: require('../../../assets/Robo_feliz_centralizado.png'),
      content: "image",
    },
  ];

  const handleScroll = event => {
    const slideSize = screenWidth * 0.85;
    const { x } = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(x / slideSize);
    setActiveSlide(currentIndex);
  };

  const handleSnapToItem = index => {
    const slideSize = screenWidth * 0.85 - 7;
    setActiveSlide(index);
    scrollViewRef.current.scrollTo({
      x: index * slideSize,
      y: 0,
      animated: true,
    });
  };

  const onPressHandler = () => {
    setModalVisible(!visible);
    setActiveSlide(0)
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      >
      <View style={styles.modalBackground}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={() => onPressHandler()}
            style={styles.icon}>
            <Icon
              type={Icons.Ionicons}
              name="ios-close-outline"
              color={'#33526E'}
              size={30}
            />
          </TouchableOpacity>
          <ScrollView
            ref={scrollViewRef}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={styles.carouselContainer}>
            {tutorialData.map((item, index) => (
              <View key={index} style={styles.slide}>
                <AText style={[styles.title, { color: colors.text }]} defaultSize={24}>
                  {t(item.title)}
                </AText>
                <UniversalPicture content={item.content} source={item.image} style={styles.image}/>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={18}>
                  {t(item.text)}
                </AText>
              </View>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {tutorialData.map((item, index) => (
              <Text
                key={index}
                style={[
                  styles.paginationDot,
                  activeSlide === index && styles.paginationDotActive,
                ]}
                onPress={() => handleSnapToItem(index)}>
                ⬤
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

/*******************Select tutorial*******************************/
export const TutorialSelect = ({ visible, setModalVisible }) => {
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const { colors } = useTheme(); //Variavel de cor do tema

  const { t, i18n } = useTranslation();

  const tutorialData = [
    {
      title: 'tutorial.select_exercise.select title 1',
      text: 'tutorial.select_exercise.select 1',
      image: require('../../../assets/Robo_pensativo_centralizado.png'),
      content: "image",
    },
    {
      title: 'tutorial.select_exercise.select title 2',
      text: 'tutorial.select_exercise.select 2',
      image: require('../../../assets/Tutorial_code.gif'),
      content: "gif",
    },
    {
      title: 'tutorial.select_exercise.select title 3',
      text: 'tutorial.select_exercise.select 3',
      image: require('../../../assets/Tutorial_indexWeb.gif'),
      content: "gif",
    },
    {
      title: 'tutorial.common.tutorial title timer',
      text: 'tutorial.common.tutorial timer',
      image: require('../../../assets/Tutorial_indexWeb.gif'), //TODO:CORRIGIR Tutorial_web.gif //IMAGEM CERTA
      content: "gif",
    },
    {
      title: 'tutorial.common.tutorial title end',
      text: 'tutorial.common.tutorial end',
      image: require('../../../assets/Robo_feliz_centralizado.png'),
      content: "image",
    },
  ];

  const handleScroll = event => {
    const slideSize = screenWidth * 0.85;
    const { x } = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(x / slideSize);
    setActiveSlide(currentIndex);
  };

  const handleSnapToItem = index => {
    const slideSize = screenWidth * 0.85 - 7;
    setActiveSlide(index);
    scrollViewRef.current.scrollTo({
      x: index * slideSize,
      y: 0,
      animated: true,
    });
  };

  const onPressHandler = () => {
    setModalVisible(!visible);
    setActiveSlide(0)
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      >
      <View style={styles.modalBackground}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={() => onPressHandler()}
            style={styles.icon}>
            <Icon
              type={Icons.Ionicons}
              name="ios-close-outline"
              color={'#33526E'}
              size={30}
            />
          </TouchableOpacity>
          <ScrollView
            ref={scrollViewRef}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={styles.carouselContainer}>
            {tutorialData.map((item, index) => (
              <View key={index} style={styles.slide}>
                <AText style={[styles.title, { color: colors.text }]} defaultSize={24}>
                  {t(item.title)}
                </AText>
                <UniversalPicture content={item.content} source={item.image} style={styles.image}/>
                <AText style={[styles.text, { color: colors.text }]} defaultSize={18}>
                  {t(item.text)}
                </AText>
              </View>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {tutorialData.map((item, index) => (
              <Text
                key={index}
                style={[
                  styles.paginationDot,
                  activeSlide === index && styles.paginationDotActive,
                ]}
                onPress={() => handleSnapToItem(index)}>
                ⬤
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.85,
    height: screenHeight * 0.85,
    backgroundColor: 'white',
    borderColor: '#637aff',
    borderWidth: 2,
    borderRadius: 15,
    overflow: 'hidden',
  },
  icon: {
    position: 'absolute',
    width: 30,
    top: 4,
    right: 4,
    zIndex: 1,
    pointerEvents: 'box-none',
  },
  carouselContainer: {
    flexGrow: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.85,
    height: screenHeight * 0.75,
    marginRight: -7, // compensação para a borda à direita
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  image: {
    width: screenWidth * 0.75,
    height: screenWidth * 0.75,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  text: {
    fontSize: 18,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  paginationDot: {
    fontSize: 30,
    marginHorizontal: 5,
  },
  paginationDotActive: {
    color: '#637aff',
  },
});