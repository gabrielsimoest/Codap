import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../types/navigation";

const useNavigate = () => {
	return useNavigation<StackNavigationProp<RootStackParamList>>();
};

export default useNavigate;
