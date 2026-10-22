import { useMutation } from "@tanstack/react-query";
import { register } from "../../services/AuthService";
import type { RegisterBody } from "codap-api/src/types/contracts";

const useRegisterMutation = () => {
	return useMutation({
		mutationFn: (body: RegisterBody) => register(body),
	});
};

export default useRegisterMutation;
