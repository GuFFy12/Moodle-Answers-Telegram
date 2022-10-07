import { Context } from "telegraf";

export interface IBotContext extends Context {
	msg: IMsg;
	session: ISessionData;
}

interface ISessionData {
	checkedTests?: number;
	course?: string | undefined;
	section?: string | undefined;
	lecture?: string | undefined;
}

interface IMsg extends Context {
	broadcast(IBroadcast): Promise<boolean>;
}

interface IBroadcast {
	users: string[];
	isCopy: boolean;
	message: {
		text: string;
		extra: { parse_mode: string };
	};
}

export interface IDB {
	value: () => ISession;
}

interface ISession {
	sessions: IData[];
}

interface IData {
	id: string;
	data: ISessionData;
}

export interface ICourse {
	[course: string]: ISection;
}

export interface ISection {
	[section: string]: ILecture;
}

export interface ILecture {
	[lecture: string]: ITest;
}

export interface ITest {
	[test: string]: IAnswer[];
}

export interface IAnswer {
	readonly question: string;
	readonly answer: string[];
}

export interface IStatistics {
	[statistic: string]: number;
}

export interface IKeysNames {
	courses: string[];
	sections: string[];
	lectures: string[];
	tests: string[];
}
