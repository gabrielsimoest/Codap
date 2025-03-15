import { ScrollView, StyleSheet, Text, View } from "react-native";
import UserHeader from "./components/UserHeader";
import { useTranslation } from "react-i18next";
import ResizableText from "../../components/ResizableText";
import UserButton from "./components/UserButton";
import ThemedIcon from "../../components/themed/ThemedIcon";
import ThemedView from "../../components/themed/ThemedView";
import useUserStore from "../../stores/UserStore";
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useNavigate from "../../hooks/useNavigate";
import { User as UserEntity } from "../../entities";
import ComingSoon from "../../components/ComingSoon";

const TextSize = 20; // Tamanho padrão da fonte

export default function User() {
	const { t } = useTranslation();

	const navigation = useNavigate();

	const { user, setUser } = useUserStore();

	const logout = async () => {
		await AsyncStorage.setItem("User", JSON.stringify({}));
		setUser({} as UserEntity);
		navigation.navigate("Login");
	};

	return (
		<ThemedView style={{ height: "100%" }}>
			<UserHeader />
			<ThemedView style={styles.direction}>
				<ThemedIcon
					type="fontawesome"
					name="user-circle"
					theme={"border"}
					useBackground
					backgroundTheme="notification"
					size={150}
					style={styles.account}
				/>
				<View style={styles.components}>
					<ResizableText style={styles.text} defaultSize={TextSize}>
						{t("name")}
					</ResizableText>
					<Text
						style={styles.text2}
						adjustsFontSizeToFit={true}
						numberOfLines={2}
					>
						{user?.Name}
					</Text>
					<ResizableText style={styles.text} defaultSize={TextSize}>
						{t("email")}
					</ResizableText>
					<Text
						style={styles.text2}
						adjustsFontSizeToFit={true}
						numberOfLines={3}
					>
						{user?.Email}
					</Text>
				</View>
			</ThemedView>
			<ScrollView
				style={styles.scroller}
				showsVerticalScrollIndicator={false}
			>
				<EditProfile />
				<ChangePassword />
				<ComingSoon />
				<UserButton
					title={t("exit")}
					onPress={logout}
					icon={
						<ThemedIcon
							type="materialCommunity"
							name="logout"
							size={25}
						/>
					}
				/>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	scroller: {
		width: "90%",
		marginLeft: "5%",
		marginBottom: "18%",
	},
	direction: {
		flexDirection: "row",
		alignItems: "center",
		height: "30%",
		marginBottom: 15,
		backgroundColor: "#141f29",
		borderTopWidth: 2,
		borderTopColor: "rgba(0,0,0, 0.2)",
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 3,
	},
	account: {
		left: "5%",
		borderRadius: 75,
		backgroundColor: "#33526E",
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 4,
	},
	components: {
		flexDirection: "column",
		width: "48%",
		marginLeft: "10%",
	},
	text: {
		color: "#E5E5E5",
		fontSize: 20,
		fontWeight: "bold",
		marginTop: 20,
	},
	text2: {
		color: "#5469D3",
		fontWeight: "bold",
		fontSize: 19,
		marginBottom: 20,
	},
	textModal: {
		flexGrow: 1,
		margin: 10,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 20,
		fontWeight: "bold",
	},
	textModal2: {
		position: "absolute",
		left: 10,
		margin: 10,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 26,
		fontWeight: "bold",
	},
	input: {
		opacity: 0.93,
		backgroundColor: "#5469D3",
		borderRadius: 10,
		height: 40,
		color: "#fff",
		marginLeft: 10,
		marginRight: 10,
		padding: 10,
	},
	contant: {
		opacity: 0.99,
		margin: 20,
		marginTop: -100,
		zIndex: 99,
		padding: 20,
		borderRadius: 30,
		borderColor: "rgba(0,0,0, 0.2)",
		backgroundColor: "#141f29",

		shadowColor: "rgba(0,0,0, 0.3)",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		elevation: 5,
		shadowOpacity: 0.28,
		shadowRadius: 4,
	},
	icon: {
		marginLeft: 260,
		top: -15,
	},
});
