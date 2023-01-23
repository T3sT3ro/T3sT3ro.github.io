// collection of tricks, hacks etc - mainly utils that will be useful for fast prototyping

// zips same length elements 
function zip(...vx) { return [...vx[0].keys()].map(i => vx.map(v => v[i])); }
function zipWith(f, ...xs) { return xs.map(e => f(...e)) }

function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

const cartesian =
    (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

// zipWith((a, b) => a+b, [1, 12], [5, 16])
// 

// Array with swizzling and automatic boxing unboxing. supports array ops like map etc.
// new Point(x, y, ...); new Point([x, y, ...]); new Point({x:})
// p.x = val; p.x = [...]; p.xyz = val; p.xy = [...]; p["xyz"] = [...]; p[[1,2,3]] = [...]
// p({x:val, y:val, ...})
// p.xxyx -> [...]; p.x -> xval; p["xy"] -> [...]; p[1] -> yval; p[[1,2,0]] -> [...]
class Point extends Array {
    static #index = k => ({ x: 0, y: 1, z: 2, w: 3, u: 0, v: 1, s: 2, t: 3, 0: 0, 1: 1, 2: 2, 3: 3 }[k]);
    static #swizzleIndices(swizzle) { // returns indices or null if invalid
        return swizzle.split(/,?/).map(Point.#index).reduce((ok, k, _, a) => ok && k >= 0 ? a : null, []);
    }
    constructor(...vals) { // (1, 2...), ([1, 2]), ({x:1, y:2})
        let obj = new Proxy([], {
            get(o, k, r) {
                let found = Reflect.get(o, k, r); if (found) return found;
                let vals = Point.#swizzleIndices(k)?.map(k => o[k]); return vals.length == 1 ? vals[0] : vals;
            },
            set(o, k, v) { return Point.#swizzleIndices(k)?.every((k, i) => (o[k] = v?.length ? v[i] : v, true)) ?? false; }
        })
        return Object.assign(obj, typeof vals[0] == 'object' ? vals[0] : vals);
    }
}