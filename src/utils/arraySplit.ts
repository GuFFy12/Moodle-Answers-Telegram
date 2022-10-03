export default (array: unknown[], max: number) => {
    const subarray = [];
    for (let i = 0; i < Math.ceil(array.length / max); i++) {
        subarray[i] = array.slice(i * max, i * max + max);
    }
    return subarray;
};
