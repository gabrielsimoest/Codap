import React, { useContext } from "react";
import { Text } from "react-native";
import { AppContext } from '../../common/Contexts/AppContext';

function AText({defaultSize = 20, ...props}) {
    const { FontSize } = useContext(AppContext);

    return (
        <Text style={[props.style, { fontSize:   FontSize + defaultSize }]}>{props.children}</Text>
    );
}

export default AText;
