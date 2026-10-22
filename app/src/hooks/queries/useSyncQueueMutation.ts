import { useMutation } from "@tanstack/react-query";
import { flushQueue } from "../../services/SyncService";

const useSyncQueueMutation = () => {
	return useMutation({
		mutationFn: () => flushQueue(),
	});
};

export default useSyncQueueMutation;
