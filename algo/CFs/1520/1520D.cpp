#include <bits/stdc++.h>
 
using namespace std;
 
void doTest() {
    int n;
    cin >> n;
    vector<int> a;
    map<long long, int> M;
 
    long long pairs = 0;
 
    for (int i = 0, ai; i < n; i++){
        cin >> ai;
        long long line = ai - i; // ax+b
        int size = (M.find(line) == M.end() ? 0 : M[line]);
        M[line] = size + 1;
        pairs += size;
    }
 
    cout << pairs << "\n";
}
 
int main() {
    int t;
    cin >> t;
    while (t--) doTest();
}