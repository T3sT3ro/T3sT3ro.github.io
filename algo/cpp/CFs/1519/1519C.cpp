#include <bits/stdc++.h>

using namespace std;

#define N 2 * 100005

int uniMap[N];

void doTest() {
    unordered_map<int, vector<int>> universities;
    int                             n;
    cin >> n;

    for (int i = 0, u; i < n; uniMap[i++] = u) cin >> u;
    for (int i = 0, skill; i < n; universities[uniMap[i++]].push_back(skill)) cin >> skill;

    vector<vector<long long>> uniPrefLists;

    for (auto &&e : universities) {
        vector<long long> prefixSums;
        prefixSums.reserve(e.second.size());

        sort(e.second.begin(), e.second.end(), greater<int>());

        for (auto &&s : e.second)
            prefixSums.push_back((prefixSums.size() == 0 ? 0 : prefixSums.back()) + s);

        uniPrefLists.push_back(prefixSums);
    }

    for (int k = 1; k <= n; ++k) {
        long long sum = 0;
        for (auto &&pf : uniPrefLists) {
            if (pf.size() < k) continue;
            sum += pf[pf.size() - 1 - (pf.size() % k)];
        }

        cout << sum << " \n"[k == n];
    }
}

int main() {
    int t;
    cin >> t;
    while (t--) doTest();

    return 0;
}