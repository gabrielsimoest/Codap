import React, { Component, useContext } from "react";
import { StyleSheet, View } from "react-native";
import OpButton from "../Helpers/OpButton";
import { AppContext } from '../common/Contexts/AppContext';

class AdjustSizeButton extends Component {


  decrementCount() {
    const { setTextAppSize } = useContext(AppContext);
    let { count, actions } = this.props;

    if (count !== 0) {
      count--;
    } else {
      count = count;
    }
    setTextAppSize(count);
  }

  incrementCount() {
    const { setTextAppSize } = useContext(AppContext);
    let { count, actions } = this.props;
    if (count !== 5) {
      count++;
    } else {
      count = count;
    }
    setTextAppSize(count);
  }

  render() {
    //const { count } = this.props;
    return (
      <View styles={styles.container}>
        <OpButton theme={"settingsButton"} title="Aumentar fonte" onPressFunction={() => this.incrementCount()} />
        <OpButton theme={"settingsButton"} title="Diminuir fonte" onPressFunction={() => this.decrementCount()} />
      </View>
    );
  }
};

// <Text style={{ fontSize: 20 + count, color: "white" }}>{count}</Text>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default AdjustSizeButton