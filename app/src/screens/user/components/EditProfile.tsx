import { useTranslation } from "react-i18next";
import { useState } from "react";
import AppButton from "../../../components/AppButton";
import AppModal from "../../../components/AppModal";
import ListRow from "../../../components/ListRow";
import TextField from "../../../components/TextField";
import DatabaseClient from "../../../services/DatabaseClient";
import useUserStore from "../../../stores/UserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAlertStore from "../../../stores/AlertStore";
import { User } from "../../../types/entities";

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
			<AppModal
				visible={visibleModal}
				onDismiss={() => setVisibleModal(false)}
				title={t("edit account")}
				footer={<AppButton title={t("change")} onPress={() => updateName()} />}
			>
				<TextField
					label={t("new name")}
					placeholder={user?.name}
					onChangeText={(value) => setNewName(value)}
					autoCapitalize="words"
					returnKeyType="done"
					onSubmitEditing={() => updateName()}
				/>
			</AppModal>
			<ListRow
				title={t("edit account")}
				icon={{ type: "ionicon", name: "create-outline" }}
				onPress={() => setVisibleModal(true)}
			/>
		</>
	);
}
