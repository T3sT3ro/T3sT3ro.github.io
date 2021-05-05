#include <bits/stdc++.h>

using namespace std;

void doTest() {
    int n;
    cin >> n;
    vector<int> t;
    vector<int> a;
    {
        int ai;
        cin >> ai;
        a.push_back(ai);
        t.push_back(0);
    }

    for (int i = 1, ai; i < n; i++) {
        cin >> ai;
        a.push_back(ai);
        int val = 0;
        for (int d = 1; d<=i; d++) {
            if(a[i-d] == ai-d) {
                val = t[i-d] + 1;
                break;
            }
        }
        t.push_back(val);
    }

    long long pairs = 0;
    for (int i = 0; i < t.size(); i++)
        pairs += t[i];
    cout << pairs << "\n";
    
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();
}