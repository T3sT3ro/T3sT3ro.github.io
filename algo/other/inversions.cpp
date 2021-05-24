#define _SCANF
//#define _SYNC
//   _CIN or _SCANF
//  _SYNC for synchronizing streams

///NOTES:
/*
point(int x, int y) : x{x}, y{y} {}
x&(-x) potêga 2 najwiêksza która dzieli x : zwraca prawy 1-bit
x&(x-1) kasuje ostatni 1-bit
command line argument: < "$(ProjectDir)IN.txt" >"$(ProjectDir)OUT.txt"
*/
using namespace std;

#include <vector>
#include <set>
#include <queue>
#include <list>

#include <cmath>
#include <algorithm>
#include <utility>
#include <functional>
#include <string>

#ifdef _CIN
#include <iostream>
#define I(x) cin>>x
#define O(x) cout<<x
#define INT(x) int x; cin>>x
#define LL(x) long long x; cin>>x
#define CHAR(x) char x; cin>>x
#define SPACE cout<<" "
#define nl cout<<'\n'

#elif defined _SCANF
#include <cstdio>
#define I(x) scanf("%d", &x)
#define O(x) printf("%d", x)
#define INT(x) int x; scanf("%d", &x)
#define LL(x) long long x; scanf("%lld", &x)
#define CHAR(x) char x; scanf(" %c", &x)
#define SPACE printf(" ")
#define nl printf("\n")
#elif !defined _CIN && !defined _SCANF
#error Standard input flag not set.
#endif
///utilities
//short names
#define ll long long
#define ull unsigned long long
#define ui unsigned int
//consts
const int oo = 2147483647;
const ll HASH = 999999937;

typedef pair<int, int> pii;
typedef pair<ll, ll> pll;
#define rep(x,a,y) for(int x=a; x<y; x++)
#define fr(x,y) rep(x, 0, y)
inline int BTS(int n) { int p = 0;  while (1 << p < n) p++; p++; return p; } //binary tree size - return power;

/*
--------Tooster--------
--- inwersje ---
*/

int tab[100005];
ll part(int p, int k) {
	if (p >= k) return 0;
	int mid = (p + k) / 2;
	ll ile = part(p, mid) + part(mid + 1, k);
	int a = p, b = mid + 1;
	vector<int> X;
	while (a <= mid && b <= k) {
		if (tab[a] > tab[b]) {
			ile += mid + 1 - a;
			X.push_back(tab[b++]);
		}
		else {
			X.push_back(tab[a++]);
		}
	}
	while (a <= mid) { X.push_back(tab[a++]); }
	while (b <= k) { X.push_back(tab[b++]); }
	fr(i, X.size())
		tab[p + i] = X[i];

	return ile;
}

inline void run() {
	INT(n);
	fr(i, n) { I(tab[i]); }
	printf("%d", part(0, n - 1));
	return;
}

int main() {
#ifdef _SYNC
	ios_base::sync_with_stdio(false);
#endif
	run();
	return 0;
}
/*

*/