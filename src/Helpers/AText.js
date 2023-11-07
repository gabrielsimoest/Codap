import React, { Component } from "react";
import { Text } from "react-native";

class AText extends Component {
    render() {
        const { font, defaultSize } = this.props;
        return (
            <Text style={[this.props.style, { fontSize: textAppSize }]}>{this.props.children}</Text>
        );
    }
};

export default AText;