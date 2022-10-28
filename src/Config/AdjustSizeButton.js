import React, { Component } from "react";
import { StyleSheet, View} from "react-native";
import OpButton from "../Helpers/OpButton";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeCount } from '../ReduxRoot/Actions/counts'

class AdjustSizeButton extends Component {
  decrementCount() {
    let { count, actions } = this.props;
    if (count !== 0) {
      count--;
    } else {
      count = count;
    }
    actions.changeCount(count);
  }
  incrementCount() {
    let { count, actions } = this.props;
    if (count !== 5) {
      count++;
    } else {
      count = count;
    }
    actions.changeCount(count);
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

const mapStateToProps = state => ({
  count: state.count.count,
});

const ActionCreators = Object.assign(
  {},
  { changeCount },
);
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdjustSizeButton)