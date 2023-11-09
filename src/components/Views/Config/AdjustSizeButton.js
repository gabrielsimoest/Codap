import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import OpButton from "../../Shared/OpButton";
import { AppContext } from '../../../common/Contexts/AppContext';

const AdjustSizeButton = () => {
  const { FontSize, toggleFont } = useContext(AppContext);

  const decrementCount = () => {
    let count  = FontSize;

    if (count !== 15) {
      count--;
    }

    toggleFont(count);
  };

  const incrementCount = () => {
    let count = FontSize;
    
    if (count !== 25) {
      count++;
    }

    toggleFont(count);
  };

  return (
    <View styles={styles.container}>
      <OpButton theme={"settingsButton"} title="Aumentar fonte" onPressFunction={incrementCount} />
      <OpButton theme={"settingsButton"} title="Diminuir fonte" onPressFunction={decrementCount} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default AdjustSizeButton;
