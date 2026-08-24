import { useTranslation } from "react-i18next";
import { useState } from "react";
import UserButton from "./UserButton";
import ComingSoon from "../../../components/ComingSoon";

export default function ChangePassword() {
	const { t } = useTranslation();

	const [visible, setVisible] = useState(false);

	return (
		<>
			<UserButton
				title={t("change password")}
				onPress={() => setVisible(true)}
			/>
			<ComingSoon visible={visible} onDismiss={() => setVisible(false)} />
		</>
	);
}
