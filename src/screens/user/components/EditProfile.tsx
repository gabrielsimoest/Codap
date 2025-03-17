import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import ResizableText from "../../../components/ResizableText";
import Icon from "../../../components/Icon";
import { useTranslation } from "react-i18next";
import UserButton from "./UserButton";
import { useState } from "react";
import ThemedView from "../../../components/themed/ThemedView";
import ModalButtonUser from "./ModalButtonUser";
import DatabaseClient from "../../../services/DatabaseClient";
import useUserStore from "../../../stores/UserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CenterView from "../../../components/layout/CenterView";
import useAlertStore from "../../../stores/AlertStore";
import { User } from "../../../entities";
import { Modal, Portal } from "react-native-paper";

const TextSize1 = 20; // Tamanho padrão da fonte
const TextSize2 = 26; // Tamanho padrão da fonte

export default function EditProfile() {
	const { t } = useTranslation();

	const [visibleModal, setVisibleModal] = useState(false);
	const [newName, setNewName] = useState<string>();

	const { user, setUser } = useUserStore();

	const setAlertMessage = useAlertStore((s) => s.setAlertMessage);
	const setAlertVisible = useAlertStore((s) => s.setAlertVisible);

	const updateName = async () => {
		if (newName !== undefined) {
			const newUser: User = { ...user!, name: newName };
			const dbClient = new DatabaseClient();
			const { changes } = dbClient.updateUser(newUser);
			if (changes !== 0) {
				setUser(newUser);
				await AsyncStorage.setItem("User", JSON.stringify(newUser));
			}
			dbClient.close();
			setVisibleModal(false);
			setAlertMessage({
				title: t("success"),
				message: t("successfully changed"),
				buttonText: t("close"),
			});
			setAlertVisible(true);
		}
	};

	return (
		<>
			<Portal>
				<Modal
					visible={visibleModal}
					onDismiss={() => setVisibleModal(false)}
					contentContainerStyle={{ flex: 1 }}
					style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
					dismissableBackButton
				>
					<CenterView
						style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
					>
						<ThemedView style={styles.contant}>
							<ResizableText
								style={styles.textModal2}
								defaultSize={TextSize2}
							>
								{t("edit account")}
							</ResizableText>
							<TouchableOpacity
								onPress={() => setVisibleModal(false)}
							>
								<Icon
									type="ionicon"
									name="close-outline"
									color={"#33526E"}
									size={60}
									style={styles.icon}
								/>
							</TouchableOpacity>
							<ResizableText
								style={styles.textModal}
								defaultSize={TextSize1}
							>
								{t("new name")}:
							</ResizableText>
							<TextInput
								style={styles.input}
								onChangeText={(value) => setNewName(value)}
							/>
							<ModalButtonUser
								title={t("change")}
								onPress={() => updateName()}
							/>
						</ThemedView>
					</CenterView>
				</Modal>
			</Portal>
			<UserButton
				title={t("edit account")}
				onPress={() => setVisibleModal(true)}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	textModal: {
		flexGrow: 1,
		margin: 10,
		fontFamily: "Roboto",
		color: "white",
		fontWeight: "bold",
	},
	textModal2: {
		position: "absolute",
		left: 10,
		margin: 10,
		fontFamily: "Roboto",
		color: "white",
		fontWeight: "bold",
	},
	input: {
		backgroundColor: "#5469D3",
		borderRadius: 10,
		height: 40,
		color: "#fff",
		marginLeft: 10,
		marginRight: 10,
		padding: 10,
		fontSize: 20,
	},
	contant: {
		height: 300,
		margin: 20,
		zIndex: 99,
		padding: 20,
		borderRadius: 30,
		borderColor: "rgba(0,0,0, 0.2)",
		backgroundColor: "#141f29",
	},
	icon: {
		marginLeft: 260,
		top: -15,
	},
});
