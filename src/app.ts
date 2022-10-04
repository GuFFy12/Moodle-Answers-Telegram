import { Context, MiddlewareFn, Telegraf } from "telegraf";
import dotenv from "dotenv";
import log4js, { Logger } from "log4js";
import LocalSession from "telegraf-session-local";
import fs from "fs";
import { IBotContext, ICourse, IKeysNames, IStatistics } from "./types/app.types.js";
import answersParser from "./utils/answersParser.js";
import MainCommands from "./commands/mainCommands.js";
import AnswersCommands from "./commands/answersCommands.js";
import sender from "telegraf-sender";
import rateLimit from "telegraf-ratelimit";

dotenv.config();

class App {
	private readonly logger: Logger;

	private readonly bot: Telegraf<IBotContext>;

	public constructor() {
		this.logger = log4js.getLogger(this.constructor.name);

		const infoText = fs.readFileSync("./help.txt", "utf-8");

		const answers = JSON.parse(fs.readFileSync("./answers.json").toString()) as ICourse;
		const { answersParsed, statistics, keysNames } = answersParser(answers, process.env.MAX_KEY_SIZE);

		this.bot = new Telegraf(process.env.BOT_TOKEN);
		const localSession = new LocalSession();

		void this.modulesInit(localSession);
		void this.commandsInit(answersParsed, statistics, localSession, keysNames, infoText);

		void this.bot.launch().then(() => {
			this.logger.info("Telegram bot started");
		});

		process.once("SIGINT", () => this.bot.stop("SIGINT"));
		process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
	}

	private readonly commandsInit = (
		answers: ICourse,
		statistics: IStatistics,
		localSession: LocalSession<unknown>,
		keysNames: IKeysNames,
		infoText: string
	) => {
		void new MainCommands(this.bot, process.env.OWNER_ID, localSession, statistics, infoText);
		void new AnswersCommands(this.bot, answers, keysNames);
	};

	private readonly modulesInit = (localSession: LocalSession<unknown>) => {
		this.bot.use(localSession.middleware());
		this.bot.use(sender as MiddlewareFn<Context>);
		this.bot.use(
			rateLimit({
				window: process.env.MESSAGE_WINDOW,
				limit: process.env.MESSAGE_LIMIT,
			}) as MiddlewareFn<Context>
		);
	};
}

new App();
