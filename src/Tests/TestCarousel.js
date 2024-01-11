/*
import React, {useRef, useState} from 'react';
import {View, Text, Image} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

export default function TestCarousel({}) {
  //const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const tutorialData = [
    {
      title: 'Página 1',
      text: 'Texto da página 1',
      image: require('../assets/Robo_advanced.png'),
    },
    {
      title: 'Página 2',
      text: 'Texto da página 2',
      image: require('../assets/Robo_master.png'),
    },
  ];

  const handleScroll = event => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const currentIndex = event.nativeEvent.contentOffset.x / slideWidth;
    setActiveSlide(currentIndex);
  };

  return (
    <View>
      <Carousel
        //ref={carouselRef}
        data={tutorialData}
        renderItem={({item}) => (
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Text>{item.title}</Text>
            <Image source={item.image} />
            <Text>{item.text}</Text>
          </View>
        )}
        onScroll={handleScroll}
        onSnapToItem={index => setActiveSlide(index)}
      />
      <Pagination
        currentIndex={activeSlide}
        items={tutorialData.map((item, index) => index)}
        activeDotStyle={{backgroundColor: 'black'}}
        inactiveDotStyle={{backgroundColor: 'grey'}}
        containerStyle={{paddingVertical: 5}}
        onDotPress={index => carouselRef.current.snapToItem(index)}
      />
    </View>
  );
}
*/

/*
import React, {useRef, useState} from 'react';
import {View, Text, Image, StyleSheet, Dimensions} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

const {width: screenWidth} = Dimensions.get('window');

const TutorialCarousel = () => {
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const tutorialData = [
    {
      title: 'Página 1',
      text: 'Texto da página 1',
      image: require('../assets/Robo_advanced.png'),
    },
    {
      title: 'Página 2',
      text: 'Texto da página 2',
      image: require('../assets/Robo_master.png'),
    },
  ];

  const handleScroll = event => {
    const slideSize = screenWidth;
    const {x} = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(x / slideSize);
    setActiveSlide(currentIndex);
  };

  const handleSnapToItem = index => {
    scrollViewRef.current.scrollTo({
      x: index * screenWidth,
      y: 0,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}>
        {tutorialData.map((item, index) => (
          <View key={index} style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.text}>{item.text}</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  image: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
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
    fontSize: 20,
    marginHorizontal: 5,
  },
  paginationDotActive: {
    color: 'black',
  },
});

export default TutorialCarousel;
*/

/*
import React, {useRef, useState} from 'react';
import {View, Text, Image, StyleSheet, Dimensions, Modal} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const TutorialCarousel = () => {
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const tutorialData = [
    {
      title: 'Página 1',
      text: 'Texto da página 1',
      image: require('../assets/Robo_advanced.png'),
    },
    {
      title: 'Página 2',
      text: 'Texto da página 2',
      image: require('../assets/Robo_master.png'),
    },
  ];

  const handleScroll = event => {
    const slideSize = screenWidth * 0.9;
    const {x} = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(x / slideSize);
    setActiveSlide(currentIndex);
  };

  const handleSnapToItem = index => {
    scrollViewRef.current.scrollTo({
      x: index * (screenWidth * 0.9),
      y: 0,
      animated: true,
    });
  };

  return (
    <View style={{backgroundColor: 'white'}}>
      <Modal style={{width: '80%'}} visible={true} transparent={true}>
        <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.carouselContainer}>
          {tutorialData.map((item, index) => (
            <View key={index} style={styles.slide}>
              <Text style={styles.title}>{item.title}</Text>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.text}>{item.text}</Text>
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
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.9,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.9,
    height: screenHeight * 0.9,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  image: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
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
    color: 'black',
  },
});

export default TutorialCarousel;
*/

import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon, {Icons} from '../components/Icons';
import {ScrollView} from 'react-native-gesture-handler';
import {useTheme} from '@react-navigation/native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const TutorialCarousel = ({visible = true}) => {
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const [visibleModal, setVisibleModal] = useState(visible);
  const {colors} = useTheme(); //Variavel de cor do tema

  const tutorialData = [
    {
      title: 'Página 1',
      text: 'Texto da página 1',
      image: require('../../assets/Robo_feliz.png'),
    },
    {
      title: 'Página 2',
      text: 'Texto da página 2',
      image: require('../../assets/Robo_master.png'),
    },
    {
      title: 'Página 3',
      text: 'Texto da página 3',
      image: require('../../assets/Robo_master.png'),
    },
    {
      title: 'Página 4',
      text: 'Texto da página 4',
      image: require('../../assets/Robo_master.png'),
    },
    {
      title: 'Página 5',
      text: 'Texto da página 5',
      image: require('../../assets/Robo_master.png'),
    },
  ];

  const handleScroll = event => {
    const slideSize = screenWidth * 0.85;
    const {x} = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(x / slideSize);
    setActiveSlide(currentIndex);
  };

  const handleSnapToItem = index => {
    const slideSize = screenWidth * 0.85;
    setActiveSlide(index);
    scrollViewRef.current.scrollTo({
      x: index * slideSize,
      y: 0,
      animated: true,
    });
  };

  return (
    <Modal
      visible={visibleModal}
      transparent={true}
      animationType="fade"
      onRequestClose={console.log('Oi')}>
      <View style={styles.modalBackground}>
        <View
          style={[styles.modalContent, {backgroundColor: colors.background}]}>
          <TouchableOpacity
            onPress={() => setVisibleModal(!visibleModal)}
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
                <Text style={[styles.title, {color: colors.text}]}>
                  {item.title}
                </Text>
                <Image source={item.image} style={styles.image} />
                <Text style={[styles.text, {color: colors.text}]}>
                  {item.text}
                </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
    height: screenHeight * 0.65,
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

export default TutorialCarousel;
