// @ts-check
// JSDoc reference: https://jsdoc.app/tags-type.html

import _ from 'lodash';

function* windowed(array: any[], size: number, step: number, partialWindows: boolean = false) {
    let s = 0;
    let stop = partialWindows ? array.length : array.length - size;
    do {
        yield array.slice(s, s + size + 1);
        s += step;
    } while (stop);
}

function* indexed<T>(iterable: Iterable<T>) {
    let i = 0;
    for (const e of iterable) {
        yield [e, i];
    }
}

function minmax_vec(...vectors) {
    return [, _.zip(...vectors).map(_.max)];
}


function withDefault(obj, defaultVal) {
    return new Proxy(obj, { get(target, key) { return obj[key] ?? defaultVal } })
}

Object.defineProperty(Object.prototype, "withDefault", {
    value: withDefault,
    writable: true,
    configurable: true,
});

function translate(vector, delta){
    for(const i in delta) vector[i] += delta
}
// _.windowed([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);