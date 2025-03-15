import { User } from "../entities";

export default function isValidUser(obj: any): obj is User {
	return (
		typeof obj === "object" && obj !== null && "ID" in obj && "email" in obj
	);
}
