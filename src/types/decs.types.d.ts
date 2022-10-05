declare module "telegraf-sender";
declare module "telegraf-ratelimit" {
	export default function limit(ILimit): never;
}

interface ILimit {
	window: number;
	limit: number;
}
