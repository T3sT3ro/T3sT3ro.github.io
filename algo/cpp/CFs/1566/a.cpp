#include <bits/stdc++.h>

using namespace std;

void doTest(){

    int n, s;
    cin >> n;
    cin >> s;
    int i = (n+1)/2;
    int k = n-i+1;
    cout << s/k << "\n";
}



int main() {

    int t;
    cin >> t;
    while(t--) doTest();
}