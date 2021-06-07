// Union-find with path compression and rank held in the same table on negative sign
//   u[nion] <a> <b> joins sets
//   f[ind] <a> gets the representant of the set
//   <CTRL+D>  exits

#include <bits/stdc++.h>
using namespace std;

vector<int> UF(10000007, -1);  // parent/rank table. Sign < 0 is the size of the set

inline int UF_rank(int x) { return -UF[x]; }  // valid only for set representatives aka UF[x] < 0

int UF_find(int v) { return UF[v] < 0 ? v : (UF[v] = UF_find(UF[v])); }

//returns root, rank as tree size heuristic
int UF_union(int a, int b) {
    if ((a = UF_find(a)) == (b = UF_find(b))) return a;
    if (UF_rank(a) < UF_rank(b)) swap(a, b);
    UF[a] += UF[b];
    return UF[b] = a;
}

int main() {
    string line, op;
    while (getline(cin, line)) {
        stringstream ss(line);
        ss >> op;

        if (op[0] == 'u') {
            int a, b;
            ss >> a >> b;
            UF_union(a, b);
        } else if (op[0] == 'f') {
            int a;
            ss >> a;
            cout << UF_find(a) << endl;
        } else {
            cout << "no." << endl;
        }
    }
    return 0;
}