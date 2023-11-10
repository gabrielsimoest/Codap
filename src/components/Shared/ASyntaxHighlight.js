import React, { useContext } from "react";
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { AppContext } from '../../common/Contexts/AppContext';

/* class ASyntaxHighlighter extends Component {
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

export default connect(mapStateToProps, mapDispatchToProps)(ASyntaxHighlighter); */

function ASyntaxHighlighter(props, {defaultSize = 15}) {
  const { FontSize } = useContext(AppContext);

  return (
    <SyntaxHighlighter
      language={props.language}
      style={props.style}
      fontSize={FontSize + defaultSize}>
      {props.code}
    </SyntaxHighlighter>
  );
}

export default ASyntaxHighlighter;
