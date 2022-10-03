import {IAnswer} from "../types/app.types.js";

export default (test: IAnswer[]) => {
    return test.reduce((result, answerObj, index) => {
        result += `${index + 1}. ${answerObj.question}\n${answerObj.answer.join("\n")}\n\n`;
        return result;
    }, "");
};
