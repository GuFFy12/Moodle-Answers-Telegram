import log4js from "log4js";
import { Context } from "telegraf";

const logger = log4js.getLogger("Reply");
logger.addContext("user", "");

export default (ctx: Context, text: string, keyboard?: object) => {
	ctx.reply(text, keyboard).catch((error) => {
		logger.error(error);
	});
};
