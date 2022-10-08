import { mainKeyboard } from "../utils/keyboards.util.js";
import { Telegraf } from "telegraf";
import log4js, { Logger } from "log4js";
import { IBotContext, IDB, IStatistics } from "../types/app.types.js";
import ctxReply from "../utils/ctxReply.util.js";
import LocalSession from "telegraf-session-local";

export default class MainCommands {
	private readonly logger: Logger;

	private readonly bot: Telegraf<IBotContext>;

	private readonly owner_id: string;
	private readonly localSession: LocalSession<unknown>;
	private readonly statistics: IStatistics;
	private readonly infoText: string;

	public constructor(
		bot: Telegraf<IBotContext>,
		owner_id: string,
		localSession: LocalSession<unknown>,
		statistics: IStatistics,
		infoText: string
	) {
		this.logger = log4js.getLogger(this.constructor.name);

		this.bot = bot;

		this.owner_id = owner_id;
		this.localSession = localSession;
		this.statistics = statistics;
		this.infoText = infoText;

		void this.commandsInit();
	}

	private readonly commandsInit = () => {
		this.bot.start((ctx) => {
			this.logger.info("New user was created");

			if (Object.keys(ctx.session).length === 0) {
				ctx.session.checkedTests = 0;
			}

			return void ctxReply(
				ctx,
				"📌 Используй /help что бы узнать больше! Канал бота: https://t.me/+AzlTc2COncJmYzAy",
				mainKeyboard
			);
		});

		this.bot.hears(/❌ Отмена|Отмена|отмена/, (ctx) => {
			this.logger.info("Cancel command has been called");
			delete ctx.session.course;
			delete ctx.session.section;
			delete ctx.session.lecture;

			return void ctxReply(ctx, `🌠 Возвращаюсь в главное меню!`, mainKeyboard);
		});

		this.bot.hears(/✨ Профиль|Профиль|профиль/, (ctx) => {
			this.logger.info("Profile command has been called");
			if (!ctx.session.checkedTests) ctx.session.checkedTests = 0;

			return void ctxReply(
				ctx,
				`🆔 Ваш id: ${ctx.update.message.from.id}\
    			\n🔑 Тестов проверено: ${ctx.session.checkedTests}`,
				mainKeyboard
			);
		});

		this.bot.hears(/🔥 Статистика|Статистика|статистика/, (ctx) => {
			this.logger.info("Statistic command has been called");
			const sessions = (this.localSession.DB as IDB).value().sessions;

			const checkedTests = sessions.reduce((result, user) => {
				if (typeof user.data.checkedTests === "number") {
					result += user.data.checkedTests;
				}
				return result;
			}, 0);

			const activeUsers = sessions.reduce((result, session) => {
				if (session.data.checkedTests && session.data.checkedTests > 0) result += 1;
				return result;
			}, 0);

			return void ctxReply(
				ctx,
				`⏱ Тестов проверенно через этого бота: ${checkedTests}\
				\n😃 Всего пользователей (активных): ${activeUsers}\
				\n\n🗂 Всего предметов: ${this.statistics.courses}\
				\n📚 Всего разделов: ${this.statistics.sections}\
				\n📒 Всего лекций: ${this.statistics.lectures}\
				\n📃 Всего тестов: ${this.statistics.tests}\
				\n❓ Всего вопросов: ${this.statistics.questions}\
				\n🙋 Всего ответов: ${this.statistics.answers}`,
				mainKeyboard
			);
		});

		this.bot.hears(/❓ Помощь|Помощь|помощь|help/, (ctx) => {
			this.logger.info("Help command has been called");
			return void ctxReply(ctx, this.infoText, mainKeyboard);
		});

		this.bot.command("sender", async (ctx) => {
			if (ctx.message.from.id.toString() !== this.owner_id) {
				this.logger.warn(`Unknown user try to call sender command, id: ${ctx.message.from.id}`);
				return;
			}
			this.logger.info("Sender command has been called");

			const text = ctx.message.text.replace("/sender", "").trim();
			if (!text) {
				this.logger.error(`Sender error: message was not found`);
				return void ctxReply(ctx, "Сообщение для рассылки не найдено!");
			}

			const users = (this.localSession.DB as IDB).value().sessions.map((session) => session.id.split(":")[0]);

			const broadcast = await ctx.msg.broadcast({
				users,
				isCopy: false,
				message: {
					text,
					extra: { parse_mode: "HTML" },
				},
			});

			this.logger.info(`Sender command was been executed with output: ${broadcast.toString()}`);
			return void ctxReply(ctx, broadcast.toString());
		});
	};
}
