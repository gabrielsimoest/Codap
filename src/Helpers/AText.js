import React, { Component } from "react";
import { Text } from "react-native";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeCount } from '../ReduxRoot/Actions/counts'

class AText extends Component {
    render() {
        const { font, defaultSize } = this.props;
        return (
            <Text style={[this.props.style, { fontSize: font + defaultSize }]}>{this.props.children}</Text>
        );
    }
};

const mapStateToProps = state => ({
    font: state.count.count,
});
const ActionCreators = Object.assign(
    {},
    { changeCount },
);
const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AText)