import {IAnswer, ICourse, IKeysNames, ILecture, ISection, IStatistics} from "../types/app.types.js";
import arraySplit from "./arraySplit.js";
import renameKey from "./renameKey.js";

export default (answers: ICourse, maxKeySize: number) => {
    const statistics: IStatistics = {
        courses: 0,
        sections: 0,
        lectures: 0,
        tests: 0,
        questions: 0,
        answers: 0,
    };

    const keysNames: IKeysNames = {
        courses: [],
        sections: [],
        lectures: [],
        tests: [],
    };

    const answersParsed = Object.keys(answers).reduce((result: ICourse, course) => {
        statistics.courses += 1;
        if (course.length > maxKeySize) {
            const newName = course.substring(0, maxKeySize).trim();
            answers = renameKey(answers, course, newName) as ICourse;
            course = newName;
        }
        if (!keysNames.courses.includes(course)) keysNames.courses.push(course);

        Object.keys(answers[course]).map((section) => {
            statistics.sections += 1;
            if (section.length > maxKeySize) {
                const newName = section.substring(0, maxKeySize).trim();
                answers[course] = renameKey(answers[course], section, newName) as ISection;
                section = newName;
            }
            if (!keysNames.sections.includes(section)) keysNames.sections.push(section);

            Object.keys(answers[course][section]).map((lecture) => {
                statistics.lectures += 1;
                if (lecture.length > maxKeySize) {
                    const newName = lecture.substring(0, maxKeySize).trim();
                    answers[course][section] = renameKey(answers[course][section], lecture, newName) as ILecture;
                    lecture = newName;
                }
                if (!keysNames.lectures.includes(lecture)) keysNames.lectures.push(lecture);

                Object.keys(answers[course][section][lecture]).map((test) => {
                    answers[course][section][lecture][test].map((answerObj) => {
                        statistics.questions += 1;
                        statistics.answers += answerObj.answer.length;
                    });

                    if (Object.keys(answers[course][section][lecture][test]).length > 10) {
                        const testsSplit = arraySplit(answers[course][section][lecture][test], 10) as IAnswer[][];

                        delete answers[course][section][lecture][test];
                        for (let i = 0; i < testsSplit.length; i++) {
                            statistics.tests += 1;

                            const testName = `${test} часть ${i + 1}`;

                            answers[course][section][lecture][testName] = testsSplit[i];

                            if (!keysNames.tests.includes(testName)) keysNames.tests.push(testName);
                        }
                    } else {
                        statistics.tests += 1;

                        if (!keysNames.tests.includes(test)) keysNames.tests.push(test);
                    }

                    return answers[course][section][lecture][test];
                });

                return answers[course][section][lecture];
            });

            return answers[course][section];
        });

        result[course] = answers[course];

        return result;
    }, {});

    return {answersParsed, statistics, keysNames};
};
