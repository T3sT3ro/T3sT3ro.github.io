#include <bits/stdc++.h>

using namespace std;

#define N 102
#define M 102
#define K 1003

int DP[N][M][K];

bool canReach(int n, int m, int k){
    if(k<0) return 0;
    if(DP[n][m][k] != -1) return DP[n][m][k];
    DP[n][m][k] = 0;

    for (int i = 1; i < n; i++) { // vertical
        if(canReach(i, m, k-m*(n-i)) == 1){
            DP[n][m][k] = 1;
            return 1;
        }
    }

    for (int i = 1; i < m; i++) { // horizontal
        if(canReach(n, i, k-n*(m-i)) == 1){
            DP[n][m][k] = 1;
            return 1;
        }
    }

    return DP[n][m][k];
}

void doTest() {
    int _n, _m, _k;
    cin >> _n >> _m >> _k;

    for (size_t i = 0; i < N; i++)
        for (size_t j = 0; j < M; j++)
            for (size_t k = 0; k < K; k++)
                DP[i][j][k] = -1;

    DP[1][1][0] = 1;

    cout << (canReach(_n,_m,_k) ? "YES" : "NO") << '\n';
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();

    return 0;
}