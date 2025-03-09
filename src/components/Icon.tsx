import {
	AntDesign,
	Entypo,
	Feather,
	FontAwesome,
	FontAwesome5,
	Foundation,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
	Octicons,
	SimpleLineIcons,
} from "@expo/vector-icons";
import { StyleProp, View } from "react-native";

const iconMap = {
	materialCommunity: MaterialCommunityIcons,
	material: MaterialIcons,
	ionicon: Ionicons,
	feather: Feather,
	fontawesome: FontAwesome,
	fontawesome5: FontAwesome5,
	antdesign: AntDesign,
	entypo: Entypo,
	simpleLineIcons: SimpleLineIcons,
	octicons: Octicons,
	foundation: Foundation,
};

type IconType =
	| "materialCommunity"
	| "material"
	| "ionicon"
	| "feather"
	| "fontawesome"
	| "fontawesome5"
	| "antdesign"
	| "entypo"
	| "simpleLineIcons"
	| "octicons"
	| "foundation";

interface Props {
	type: IconType;
	name: string;
	color: string;
	size?: number;
	style?: StyleProp<View>;
}

const Icon = ({ type, name, color, size = 24, style }: Props) => {
	const Tag = iconMap[type];
	return (
		<>
			{type && name && (
				<Tag name={name} size={size} color={color} style={style} />
			)}
		</>
	);
};

export default Icon;
