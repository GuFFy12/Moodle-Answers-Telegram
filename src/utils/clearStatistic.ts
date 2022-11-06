import LocalSession from "telegraf-session-local";

import { IDB } from "../types/app.types.js";

export default (localSession: LocalSession<unknown>) => {
	const sessions = (localSession.DB as IDB).value().sessions;

	return sessions.reduce(
		(result, session) => {
			if (typeof session.data.checkedTests === "number" && session.data.checkedTests > 0) {
				result.checkedTests += session.data.checkedTests;
				result.activeUsers += 1;
			}
			return result;
		},
		{ checkedTests: 0, activeUsers: 0 }
	);
};
