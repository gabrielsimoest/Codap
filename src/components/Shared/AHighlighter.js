import HighlightText from "@sanar/react-native-highlight-text";
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeCount } from '../../ReduxRoot/Actions/counts'

class AHighlighter extends Component {
    render() {
        const { font, defaultSize=20, highlight, wordHighlight, text, style } = this.props;
        return (
            <HighlightText
                style={[ style ,{ fontSize: font + defaultSize }]}
                highlightStyle={highlight}
                searchWords={wordHighlight}
                textToHighlight={text}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(AHighlighter)

