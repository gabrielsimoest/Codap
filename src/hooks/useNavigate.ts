import { useNavigation } from "@react-navigation/native";

interface NavigationProps {
	navigate: (routeName: string) => void;
}

const useNavigate = () => {
	return useNavigation<NavigationProps>();
};

export default useNavigate;
