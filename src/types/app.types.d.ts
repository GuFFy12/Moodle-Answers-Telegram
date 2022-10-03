import {Context} from "telegraf";

export interface IBotContext extends Context {
    session: ISessionData;
}

interface ISessionData {
    checkedTests?: number;
    course?: string | undefined;
    section?: string | undefined;
    lecture?: string | undefined;
}

export interface IDB {
    value: () => ISession;
}

interface ISession {
    sessions: ISessionData[];
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
    courses: number;
    sections: number;
    lectures: number;
    tests: number;
    questions: number;
    answers: number;
}

export interface IKeysNames {
    courses: string[];
    sections: string[];
    lectures: string[];
    tests: string[];
}
