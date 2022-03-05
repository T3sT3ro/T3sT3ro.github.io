#include <bits/stdc++.h>

using namespace std;

void doTest() {
    string s1, s2;
    int n;
    cin >> n >> s1 >> s2;

    int sum = 0;

    bool met11 = false;
    bool met00 = false;

    for (int i = 0; i < n; i++) {
        if (s1[i] != s2[i]) {  //       01 or 10
            sum += 2;
            met11 = false;
            met00 = false;
        } else if(s1[i] == '0'){
            met00 = true; 
            ++sum;
        } else {
            met11 = true;
        }
        if(met00 && met11) {
            ++sum;
            met00 = met11 = false;
        }
    }
    cout << sum << "\n";
}

int main() {
    ios_base::sync_with_stdio(0);
    int t;
    cin >> t;
    while (t--) doTest();
}