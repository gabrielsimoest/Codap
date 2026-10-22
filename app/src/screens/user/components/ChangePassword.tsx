import { useTranslation } from "react-i18next";
import { useState } from "react";
import ListRow from "../../../components/ListRow";
import ComingSoon from "../../../components/ComingSoon";

export default function ChangePassword() {
	const { t } = useTranslation();

	const [visible, setVisible] = useState(false);

	return (
		<>
			<ListRow
				title={t("change password")}
				icon={{ type: "ionicon", name: "key-outline" }}
				onPress={() => setVisible(true)}
			/>
			<ComingSoon visible={visible} onDismiss={() => setVisible(false)} />
		</>
	);
}
