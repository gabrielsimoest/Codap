import React, { useContext } from "react";
import { Text } from "react-native";
import { AppContext } from '../../common/Contexts/AppContext';

function AText(props, {defaultSize = 20}) {
    const { FontSize } = useContext(AppContext);

    return (
        <Text style={[props.style, { fontSize: defaultSize + FontSize }]}>{props.children}</Text>
    );
}

export default AText;
