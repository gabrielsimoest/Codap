import { StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import ConfigHeader from "./components/ConfigHeader";
import Icon from "../../components/Icon";
import ThemeSwitcher from "./components/ThemeSwitcher";
import FontSizeChanger from "./components/FontSizeChanger";
import LanguageSelector from "./components/LanguageSelector";
import ResizableText from "../../components/ResizableText";
import ThemedView from "../../components/themed/ThemedView";
import RowView from "../../components/layout/RowView";
import ThemedLine from "../../components/themed/ThemedLine";
import ConfigHeading from "./components/ConfigHeading";
/* import { AppContext } from '../../../common/Contexts/AppContext';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions'; */
const TextSize = 25;

export default function Config() {
	//Constante de tradução, usar {t("CHAVE")} para tradução
	const { t } = useTranslation();

	/* const { notificationState, toggleNotification, showAlert } = useContext(AppContext); */

	//Switch
	/* const [isSwitchOn, setIsSwitchOn] = React.useState(notificationState); */

	/* const onToggleSwitch = () => {
        const newState = !isSwitchOn;
        setIsSwitchOn(newState);
        toggleNotification(newState);
        if (newState) {
            check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
                .then((result) => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log('This feature is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            console.log('The permission has not been requested / is denied but requestable');
                            setIsSwitchOn(false);
                            toggleNotification(false);
                            showAlert(t("alert.notification.title"), t("alert.notification.message"));
                            break;
                        case RESULTS.GRANTED:
                            console.log('The permission is granted');
                            break;
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        };
    };
 */
	return (
		<ThemedView style={{ flex: 1 }}>
			<ConfigHeader title={t("settings")} />
			<ScrollView
				style={styles.scroller}
				showsVerticalScrollIndicator={false}
			>
				<ConfigHeading
					iconType="materialCommunity"
					iconName="cellphone-cog"
					title={t("system")}
				/>
				<LanguageSelector />
				<FontSizeChanger />
				<ThemeSwitcher />
				<ConfigHeading
					iconType="ionicon"
					iconName="notifications"
					title={t("notification")}
				/>
				{/* <TouchableOpacity style={[styles.button, { backgroundColor: colors.background }]} onPress={() => onToggleSwitch()}>
                    <ResizableText defaultSize={TextSize} />{t("notification")}</ResizableText>
                    <Switch style={{ marginTop: 5 }} value={isSwitchOn} onValueChange={onToggleSwitch} color={'#5469D3'} />
                </TouchableOpacity> */}
				<ConfigHeading
					iconType="materialCommunity"
					iconName="information-outline"
					title={t("informations")}
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
	text: {
		color: "#5469D3",
		fontSize: 25,
		marginRight: 10,
	},

	icon: {
		marginRight: 10,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 60,
		padding: 10,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 10,
		marginBottom: 15,
		backgroundColor: "#141f29",
		borderRadius: 10,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 7,
	},
});
