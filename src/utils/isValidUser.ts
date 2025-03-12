import { User } from "../entities";

export default function isValidUser(obj: any): obj is User {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"ID" in obj &&
		"Name" in obj &&
		"Email" in obj &&
		"DependaBots" in obj &&
		"XP" in obj &&
		"Double" in obj
	);
}
