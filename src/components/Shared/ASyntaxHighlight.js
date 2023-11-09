import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changeCount} from '../../ReduxRoot/Actions/counts';
import SyntaxHighlighter from 'react-native-syntax-highlighter';

class ASyntaxHighlighter extends Component {
  render() {
    const {font, defaultSize = 15, style, language, code} = this.props;
    return (
      <SyntaxHighlighter
        language={language}
        style={style}
        fontSize={font + defaultSize}>
        {code}
      </SyntaxHighlighter>
    );
  }
}

const mapStateToProps = state => ({
  font: state.count.count,
});
const ActionCreators = Object.assign({}, {changeCount});
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ASyntaxHighlighter);
