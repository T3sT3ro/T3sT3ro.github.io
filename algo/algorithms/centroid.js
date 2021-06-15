// finds centroids (up to 2) of graph represented as dictionary of {vertex_1 -> [children], ...}
function centroid(G) { // G is graph
    let n = G.size;
    let [centroids, sz] = [[], []]; // sz = sizes of subtrees
            
    function dfs(u, prev) {
        sz[u] = 1;
        let centroidCandidate = true;
        for (const v of G[u]) if (v != prev) {
            dfs(v, u);
            sz[u] += sz[v];
            if (sz[v] > n / 2) centroidCandidate = false;
        }
        if (n - sz[u] > n / 2) centroidCandidate = false;
        if (centroidCandidate) centroids.push(u);
    }
    
    dfs(0, -1);
    return centroids;
}
