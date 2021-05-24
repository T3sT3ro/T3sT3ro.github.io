#include <bits/stdc++.h>

using namespace std;


// Idea:
// when there is a pair of same elements at indices i and j, it increases by 1 each segment [<=i, >=j]:
//   [+++++X....X+++++] - pluses mark ends of intervals that have increased weight by this pair.
// Knowing that first X is at k we know, that it influences all segments starting at 0,1,...,k and
// in pair with newly added X that influences n-i segments ending at and after him it's clear how many are influenced
// to account for all previous Xs that make a pair with newly added X we cumulatively add values to the map
void doTest() {
    int n;
    cin >> n;
    unordered_map<int, long long> m;

    long long weight = 0;

    for (int i = 0; i < n; i++)
    {
        int x;
        cin >> x;

        if(m.find(x) == m.end()){
            m[x] = i+1;
            continue;
        }
        weight += m[x] * (n-i);
        m[x] += (i+1);
    }
    cout << weight << "\n";
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();
    return 0;
}