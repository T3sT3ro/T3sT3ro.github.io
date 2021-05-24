//#define _CIN
//#define _SYNC
//  _CIN or none
//  _SYNC for synchronizing streams

///NOTES:
/*
point(int x, int y) : x{x}, y{y} {}
x&(-x) potęga 2 najwi�ksza kt�ra dzieli x : zwraca prawy 1-bit
x&(x-1) kasuje ostatni 1-bit
command line argument: < "$(ProjectDir)IN.txt" >"$(ProjectDir)OUT.txt"
*/
using namespace std;

#include <vector>
#include <set>
#include <queue>
#include <bitset>
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
#define CHAR(x) char x; cin >> x
#define SPACE cout<<" "
#define nl cout<<'\n'

#else
#include <cstdio>
#define I(x) scanf("%d", &x)
#define O(x) printf("%d", x)
#define INT(x) int x; scanf("%d", &x)
#define LL(x) long long x; scanf("%lld", &x)
#define CHAR(x) char x; scanf(" %c", &x)
#define SPACE printf(" ")
#define nl printf("\n")
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
#define rep(x,a,y) for(int x=a; x!=y; x+= 1 - 2*(a>y))
#define fr(x,y) rep(x, 0, y)
inline int BTS(int n) { int p = 0;  while (1 << p < n) p++; p++; return p; } //binary tree size - return power;

/*
--------Tooster--------
# COCI 09/10 round 6 HOLMES
*/

bool green[1000];
bool calcd[1000];
bitset<1000> B[1000];
vector< int > son[1000];
vector< int > par[1000];
vector<int> VGreen;
vector<int> VWhite;

void supers(int v) {
	if (calcd[v]) return;
	calcd[v] = true;
	if (!green[v]) VWhite.push_back(v);
	if (par[v].empty()) {
		B[v][v] = true;
		return;
	}
	fr(u, par[v].size()) {
		supers(par[v][u]);
		B[v] |= B[par[v][u]];
	}
}

void mark(int v, bool push_flag) {
	if (green[v]) return;
	green[v] = true;
	if (push_flag) VGreen.push_back(v);
	fr(u, son[v].size()) mark(son[v][u], push_flag);
	if (son[v].empty()) supers(v);
}

inline void run() {
	INT(D); INT(M); INT(N);
	fr(i, M) {
		INT(a); INT(b); a--; b--;
		son[a].push_back(b);
		par[b].push_back(a);
	}

	fr(i, N) {
		INT(X); X--;
		mark(X, true);
	}

	fr(i, D)
		if (!calcd[i])
			supers(i);

	fr(i, VWhite.size()) {
		if (!green[VWhite[i]]) {
			int v = VWhite[i];
			fr(j, VGreen.size()) {
				int u = VGreen[j];
				if ((B[u] & B[v]) == B[u]) {
					mark(v, false);
					break;
				}
			}
		}
	}

	fr(i, 1000) if (green[i]) printf("%d ", i + 1);
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
3 2 1
1 2
2 3
2
===
1 2 3
--------
3 2 1
1 3
2 3
3
===
3
--------
4 4 1
1 2
1 3
2 4
3 4
4
===
1 2 3 4
*/