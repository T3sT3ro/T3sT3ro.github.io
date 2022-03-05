#include <bits/stdc++.h>

using namespace std;

void doTest(){

    string s;
    cin >> s;
    
    
    int last = s[0];
    int zeroRuns = (last == '0');
    for (auto &&c : s)
    {
        if (c != last && c == '0') ++zeroRuns;
        last = c;
    }
    if(zeroRuns > 2) zeroRuns = 2;
    cout << zeroRuns << "\n";
}



int main() {

    int t;
    cin >> t;
    while(t--) doTest();
}