#include <bits/stdc++.h>

using namespace std;

// __lg() gives floor logarithm (found on CFs)
void doTest() {
    int n;
    cin >> n;
    if(n == 1) {
        cout << "1\n";
        return;
    }

    vector<int> t;
    int         m = INT_MIN;
    while (n--) {
        int x;
        cin >> x;
        if (x > m) m = x;
        t.push_back(x);
    }

    sort(t.begin(), t.end());

    for (int i = 1; i < t.size(); i++) {
        int maxAllowed = abs(t[i] - t[i-1]);
    }
    
    
    cout  << cnt << "\n";
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();
    return 0;
}