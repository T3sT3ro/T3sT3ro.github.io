// nodes start from 0
class Graph {
    constructor(parents = []) {
        parents.forEach((p, c) => {
            if (p != -1)
                this.addEdges([p, c], [c, p]);
        });
        Object.defineProperty(this, "n", { enumerable: false, writable: true });
        return this;
    }

    addDirectedEdges(...edges) {
        for (const [a, b] of edges) {
            this[a] = (this[a] ?? []);
            this[a].push(b);
            this.n = Math.max(this.n ?? -Infinity, a + 1, b + 1);
        }
        return this;
    };

    addEdges(...edges) {
        this.addDirectedEdges(...edges);
        this.addDirectedEdges(...edges.map(([a, b]) => [b, a]));
        return this;
    };

    parents(root = 0) {
        let parent = [];
        let self = this;
        function dfs(v) {
            for (const u of self[v]) {
                if (u != parent[v]) {
                    parent[u] = v;
                    dfs(u);
                }
            }
        }
        parent[root] = -1;
        dfs(root);
        return parent;
    };

    edges() {
        let edges = [];
        for (const [p, cx] of Object.entries(this))
            edges.push(...cx.map(c => [+p, c]));
        return edges;
    }
}

// Random forest can be generated by cutting edges of random tree.
//  But this approach would result in very skewed distribution, where most trees are small.
//  For example in full binary tree, the probability of cutting an edge just under root would be 2/n ~= 0%, 
//  while cutting leafs 50%.
// One way to fix this could be choosing edges to cut from weighted probability,
//  for example edge at distance d from root has weight 1/(#nodes of edges at distance d)
// Another way is to generate trees separately, but in this approach there is less control over tree heights in the forest


// O(n) solution from https://cp-algorithms.com/graph/pruefer_code.html
// valid tree has nodes 0..n-1
function toPruferCode(tree) {
    let [ptr, degree, parent] = [-1, [], tree.parents(tree.n - 1)];
    for (const i in parent) {
        degree[i] = tree[i].length;
        if (tree[i].length == 1 && ptr == -1)
            ptr = i;
    }
    let [leaf, code] = [ptr, []];
    for (let i = 0; i < tree.n - 2; ++i) {
        let next = parent[leaf];
        code[i] = next;
        if (--degree[next] == 1 && next < ptr) {
            leaf = next;
        } else {
            do { ++ptr } while (degree[ptr] != 1);
            leaf = ptr;
        }
    }
    return code;
}

// O(n) solution 
// valid tree has nodes 0..n-1
function fromPruferCode(code) {
    let [ptr, degree] = [-1, [...new Array(code.length + 2).fill(1)]];
    for (const node of code)
        ++degree[node];
    while (degree[ptr] != 1)
        ++ptr;
    let [leaf, tree] = [ptr, new Graph()];
    for (const v of code) {
        tree.addEdges([leaf, v]);
        if (--degree[v] == 1 && v < ptr)
            leaf = v;
        else {
            do { ++ptr } while (degree[ptr] != 1);
            leaf = ptr;
        }
    }
    return tree.addEdges([leaf, code.length + 1]);
}