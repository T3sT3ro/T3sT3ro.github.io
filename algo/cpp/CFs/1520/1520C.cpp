#include <bits/stdc++.h>

using namespace std;

void doTest() {
    int n;
    cin >> n;

    if (n == 1) {
        cout << 1 << "\n";
        return;
    }

    if (n == 2) {
        cout << -1 << "\n";
        return;
    }

    int num = 1;

    int t[100][100];

    for (int i = 0; i < n; i ++)
        for (int j = (i & 1 != 0 ? 0 : 1) ; j < n; j += 2)
            t[i][j] = num++;

    for (int i = 0; i < n; i ++)
        for (int j = (i & 1 != 0 ? 1 : 0) ; j < n; j += 2)
            t[i][j] = num++;

    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cout << t[i][j] << " \n"[j==n-1];
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();
}