#include <bits/stdc++.h>

using namespace std;

// __lg() gives floor logarithm (found on CFs)
void doTest() {
    int n;
    cin >> n;
    vector<int> t;
    int         m = INT_MAX;
    while (n--) {
        int x;
        cin >> x;
        if (x < m) m = x;
        t.push_back(x);
    }
    int cnt = 0;
    for (auto &&x : t)
        if (x != m) cnt++;

    cout  << cnt << "\n";
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();
    return 0;
}