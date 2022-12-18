import _ from 'lodash';

// TODO: set of arrays

type Mutable = (any | Mutable)[];

/**
 * 
 * @param vectors same-dimensional vectors
 * @returns transposed matrix
 */
export function transpose(...vectors: any[][]) {
    _.zip(...vectors);
}

_.mixin({
    transpose: transpose
});

//TODO 
/**
 * @class Implementation of a dynamic array with automatically resizing bounds. 
 */
class MuTable {
    /**
     * Returns default value
     * @param defaulter Optional default value provider or value itself.
     * @returns proxied dynamic array
     */
    constructor(defaulter: any) {

        let defaultProvider = (typeof defaulter === 'function')
            ? this.basicDefaultProvider
            : () => defaulter;

        return new Proxy(this, {
            get(target, idx, recv) {
                return Object.hasOwnProperty(idx) ? target[idx] : defaultProvider(idx);
            },
            set(target, idx, val, recv) {
                if (Object.hasOwnProperty(idx))
                    return true;
            }
        });
    }

    basicDefaultProvider(idx) { }
}

/// ============== table functions

export function mapAll(table: Mutable, mapper) {
    if (!Array.isArray(table)) 
        return mapper(table);
    else
        return table.map(r => mapAll(r, mapper));
}

export function* allCoordinates(table) {
    if (typeof table != 'object') return [];
    for (const k in table)
        for (const c in allCoordinates(table[k]))
            yield [k, ...c];
}
