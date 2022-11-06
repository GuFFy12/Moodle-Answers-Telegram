import { ICourse } from "../types/app.types.js";
import arraySplit from "./arraySplit.util.js";

export const mainKeyboard = {
	reply_markup: {
		keyboard: [[{ text: "✅ Ответы" }], [{ text: "✨ Профиль" }, { text: "🔥 Статистика" }, { text: "❓ Помощь" }]],
		resize_keyboard: true,
	},
};

export const coursesKeyboard = (answers: string[]) => {
	return {
		reply_markup: {
			keyboard: [...(arraySplit(answers, 2) as string[][]), [{ text: "❌ Отмена" }]],
			resize_keyboard: true,
		},
	};
};

export const createSectionsKeyboard = (answers: ICourse, course: string) => {
	return {
		reply_markup: {
			keyboard: [...(arraySplit(Object.keys(answers[course]), 2) as string[][]), [{ text: "❌ Отмена" }]],
			resize_keyboard: true,
		},
	};
};

export const createLecturesKeyboard = (answers: ICourse, course: string, section: string) => {
	return {
		reply_markup: {
			keyboard: [
				...(arraySplit(Object.keys(answers[course][section]), 2) as string[][]),
				[{ text: "❌ Отмена" }],
			],
			resize_keyboard: true,
		},
	};
};

export const createTestsKeyboard = (answers: ICourse, course: string, section: string, lecture: string) => {
	return {
		reply_markup: {
			keyboard: [
				...(arraySplit(Object.keys(answers[course][section][lecture]), 2) as string[][]),
				[{ text: "❌ Отмена" }],
			],
			resize_keyboard: true,
		},
	};
};
