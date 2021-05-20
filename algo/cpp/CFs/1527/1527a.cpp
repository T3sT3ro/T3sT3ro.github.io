#include <bits/stdc++.h>

using namespace std;

// __lg() gives floor logarithm (found on CFs)
void doTest(){
    int n;
    cin >> n;
    auto leadingZeros = __builtin_clz(n);
    cout << (1 << (31 - leadingZeros))-1 << "\n";

}

int main(){
    int t;
    cin >> t;
    while(t--) doTest();
    return 0;
}