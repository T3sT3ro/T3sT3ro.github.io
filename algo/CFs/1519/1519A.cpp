#include <bits/stdc++.h>

using namespace std;

void doTest() {
    int r, b, d;
    cin >> r >> b >> d;

    int m = min(r, b);
    int M = max(r, b);

    cout << (((M-1) / m > d) ? "NO" : "YES") << "\n";
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();

    return 0;
}