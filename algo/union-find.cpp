#define _SCANF
//#define _SYNC
//   _CIN or _SCANF
//  _SYNC for synchronizing streams

///NOTES:
/*
point(int x, int y) : x{x}, y{y} {}
x&(-x) pot�ga 2 najwi�ksza kt�ra dzieli x : zwraca prawy 1-bit
x&(x-1) kasuje ostatni 1-bit
command line argument: < "$(ProjectDir)IN.txt" >"$(ProjectDir)OUT.txt"
*/
using namespace std;

#include <vector>
#include <set>
#include <queue>

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
const ll LLoo = 9223372036854775807;
const ll HASH = 999999937;

typedef pair<int, int> pii;
typedef pair<ll, ll> pll;
#define rep(x,a,y) for(int x=a; x<y; x++)
#define fr(x,y) rep(x, 0, y)
inline int BTS(int n) { int p = 0;  while (1 << p < n) p++; p++; return p; } //binary tree size - return power;

																			 /*
																			 --------Tooster--------
																			 */
int par[1 << 16];

int _find(int v) { return par[v] < 0 ? v : (par[v] = _find(par[v])); }
void _union(int a, int b) {
	if ((a = _find(a)) == (b = _find(b))) return;
	if (par[a] < par[b]) swap(a, b);
	par[a] += par[b];
	par[b] = a;
	return;
}

inline void run() {
	INT(n); INT(q);
	fr(i, n + 1) par[i] = -1;
	while (q--) {
		CHAR(o);
		if (o == 'e') return;
		INT(a);
		if (o == 'u') { INT(b); _union(a, b); }
		if (o == 'f') printf("setID: <%d>    size: [%d]\n", _find(a), -par[_find(a)]);
	}
	return;
}

int main() {
#ifdef _SYNC
	ios_base::sync_with_stdio(false);
#endif
	run();
	return 0;
}