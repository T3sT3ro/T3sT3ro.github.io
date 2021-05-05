#include <bits/stdc++.h>

using namespace std;

void doTest(){

    int n;
    string s;
    cin >> n;
    cin >> s;

    int met[26];
    int last = -1;
    for (size_t i = 0; i < 26; i++)
        met[i] = 0;

    bool good = true;
    for (size_t i = 0; i < n && good; i++) {
        if (met[s[i]-'A'] && last != s[i]) good = false;
        met[s[i]-'A'] = true;
        last = s[i];
    }
    
    cout << (good ? "YES" : "NO") << "\n";
}



int main() {

    int t;
    cin >> t;
    while(t--) doTest();
}