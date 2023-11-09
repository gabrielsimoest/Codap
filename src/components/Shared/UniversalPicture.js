import React from 'react';
import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';

export default function UniversalPicture({ content = "image", source, style }) {
  return (
    content == "gif" ? <FastImage source={source} style={style}/> : <Image source={source} style={style}/>
  );
};