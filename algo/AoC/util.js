// @ts-check
// JSDoc reference: https://jsdoc.app/tags-type.html

const _ = require('lodash');

// TODO test
_.mixin({
    windowed: function* (array, n, partialWindows = false) {
        for (let i = 0; i + n <= array.length; i++) {
            yield array.slice(i, i + n);
        }
    }
});

/**
 * @mixin
 */
_.mixin({
    minmax_vec: function (...vectors) {
        return [_.zip(...vectors).map(_.min), _.zip(...vectors).map(_.max)];
    }
});

_.mixin({
    minmax: function (arr) {
        return [_.min(arr), _.max(arr)];
    }
})

//TODO 
/**
 * @class Implementation of a dynamic array with automatically resizing bounds. 
 */
class MuTable {
    /**
     * Returns default value
     * @param {(idx: any) => any | any} [deafulter] Optional default value provider or value itself.
     * @returns proxied dynamic array
     */
    constructor(deafulter) {

        let defaultProvider = (typeof deafulter === 'function') ? deafulter : () => deafulter;
        return new Proxy(this, {
            get(target, idx, recv) {
                return Object.hasOwnProperty(idx) ? target[idx] : defaultProvider(idx);
            },
            set(target, idx, val) {
                if (Object.hasOwnProperty(idx)) 
                return;
            }
        });
    }

    basicDefaultProvider(idx) { }
}

// function *findMinMax(...cords) {
//     let [min, max] = [cords, cords];
//     while(x !== undefined && y !== undefined) {
//         min = _.zip(min, cords).map([min, current] => Math.min(min, current))
//         [xmin, ymin] = [Math.min(xmin, x), Math.min(ymin, y)]; // DBG
//         [xmax, ymax] = [Math.max(xmax, x), Math.max(ymax, y)]; // DBG
//         yield [[xmin, xmax], [ymin, ymax]]; 
//     }
//     return [[xmin, xmax], [ymin, ymax]]; 
// }


console.log(
    _.minmax_vec(
        [11, 1],
        [12, 2],
        [13, 3],
        [14, 4],
        [15, 5]
    )
);
