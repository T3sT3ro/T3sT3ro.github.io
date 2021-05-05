#include <bits/stdc++.h>

using namespace std;

#define N 1000006
#define long int64_t

vector<long> pref(N, 0);
vector<long> suff(N, 0);
int         n;
string      s;

template<typename T>
void traverse(int startInclusive, int endExclusive, int delta, vector<T> &fold) {
    for (int i = startInclusive, sheep = 0; i != endExclusive; i += delta) {
        if (s[i] == '.' && sheep == 0) continue;

        if (s[i] == '*') {
            ++sheep;
            fold[i] = i > 0 ? fold[i - delta] : 0;
        } else {
            fold[i] = (i > 0 ? fold[i - delta] : 0) + sheep;
        }
    }
}

void doTest() {
    cin >> n;
    cin >> s;

    {  // init, innit ?
        pref.assign(s.size()+1, 0);
        suff.assign(s.size()+1  , 0);
    }

    traverse(0, s.size(), +1, pref);
    traverse(s.size() - 1, -1, -1, suff);

    long moves = LLONG_MAX;
    for (int i = 0; i < n - 1; i++)
        moves = min(moves, pref[i] + suff[i + 1]);

    cout << (moves == LLONG_MAX ? 0 : moves) << "\n";
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();
}