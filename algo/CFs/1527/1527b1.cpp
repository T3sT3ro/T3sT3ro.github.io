#include <bits/stdc++.h>

using namespace std;

// this doesn't work... but should ???
void doTest() {
    int n;
    cin >> n;
    string s;
    cin >> s;

    int zeros = 0;
    for (int i = 0; i < n; ++i)
        if (s[i] == '0') ++zeros;
    
    cout << (zeros & 1 && zeros != 1 ? "ALICE" : "BOB") << "\n";
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();
    return 0;
}