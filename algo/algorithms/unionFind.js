// union find structure with path compression and rank statistic in the root node
class UF {
    #uf = new Proxy([], { get: (uf, v) => uf.hasOwnProperty(v) ? uf[v] : -1 });
    rank(v) { return -this.#uf[this.find(v)]; }
    find(v) { return this.#uf[v] < 0 ? v : (this.#uf[v] = this.find(this.#uf[v])); } // path compression
    union(a, b) { //returns root, rank as tree size heuristic
        [a, b] = [this.find(a), this.find(b)];
        if(a == b) return a;
        if(this.rank(a) < this.rank(b)) [a, b] = [b, a];
        this.#uf[a] += this.#uf[b];
        return this.#uf[b] = a;
    }
}

