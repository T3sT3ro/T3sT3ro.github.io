// bidirectional mapping used to relabel nodes in trees basically. .forward[i] to get label .backward[label] to go back
class Bimap {
    constructor(permutation = {}, defaultForward = k => undefined, defaultBackward = l => undefined) {
        let [f, b] = [permutation, Object.fromEntries(Object.entries(permutation).map(e => e.reverse()))];
        this.forward = new Proxy(f, { get: (f, k) => f[k] ?? defaultForward(k) });
        this.backward = new Proxy(b, { get: (r, k) => r[k] ?? defaultBackward(k) });
    }
}