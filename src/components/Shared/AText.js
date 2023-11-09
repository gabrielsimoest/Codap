import React, { useContext } from "react";
import { Text } from "react-native";
import { AppContext } from '../../common/Contexts/AppContext';

function AText(props) {
    const { textAppSize } = useContext(AppContext);

    return (
        <Text style={[props.style, { fontSize: textAppSize }]}>{props.children}</Text>
    );
}

export default AText;
