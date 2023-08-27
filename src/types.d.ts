import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { Composer, Context, SessionFlavor } from 'grammy';

interface Command {
	composer: Composer<MyContext>;
	command?(ctx: MyContext): Promise<void>;
	conversation?(conversation: MyConversation, ctx: MyContext): Promise<void>;
}

interface SessionData {
	checkedModulesCount: number;
}

interface BotConfig {
	isDeveloper: boolean;
}

type MyContext = Context &
	SessionFlavor<SessionData> &
	ConversationFlavor & {
		config: BotConfig;
	};
type MyConversation = Conversation<MyContext>;
