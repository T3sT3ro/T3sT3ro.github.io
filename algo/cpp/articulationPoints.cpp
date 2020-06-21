#include <bits/stdc++.h>

using namespace std;

#define N 5003
#define M 200005

vector<vector<int> > V(N);
int                  low[N];
int                  vis[N];

set<int> crit;

void SET_CRITICAL(int v) { // CAN ADD VERTICES MULTIPLE TIMES!!! 
    crit.insert(v);
}

void DFS(int p, int v) {
    vis[v] = low[v] = vis[p] + 1;  // timestamp
    //cerr << "\nIN#\t" << v << ": vis:" << vis[v] << "\tlow:" << low[v];
    int children    = 0;
    for (auto w : V[v]) {
        if (w == p) continue;
        if (vis[w] > 0)
            low[v] = min(low[v], vis[w]);  // back edge
        else {
            DFS(v, w);
            low[v] = min(low[v], low[w]);
            if (vis[v] <= low[w] && p != 0)  // for non-root
                SET_CRITICAL(v);
            children++;
        }
    }
    //cerr << "\nOUT#\t" << v << ": vis:" << vis[v] << "\tlow:" << low[v];
    if (p == 0 && children > 1)
        SET_CRITICAL(v);
}

int main() {
    for (int i = 0; i < N; i++) low[i] = vis[i] = -1;

    int n, m;
    cin >> n >> m;
    while (m--) {
        int a, b;
        cin >> a >> b;
        V[a].push_back(b);
        V[b].push_back(a);
    }

    vis[0] = 0;  // 0 doesn't belong to the tree
    DFS(0, 1);
    cout << crit.size() << "\n";
    for (auto w : crit) cout << w << " ";
    return 0;
}

// 