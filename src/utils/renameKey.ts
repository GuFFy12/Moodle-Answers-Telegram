export default (oldObj: IObject, oldKey: string, newKey: string) => {
	const keys = Object.keys(oldObj);
	return keys.reduce((acc: IObject, val) => {
		if (val === oldKey) {
			acc[newKey] = oldObj[oldKey];
		} else {
			acc[val] = oldObj[val];
		}
		return acc;
	}, {});
};

interface IObject {
	[key: string]: object;
}
