#include <bits/stdc++.h>

#define debug(...) 42
#ifdef LOCAL
#define debug(...) cerr << "[" << #__VA_ARGS__ << "]:", debug_out(__VA_ARGS__)
#endif

#define long int_64t
template<typename T,typename... Args>T vamax(T &a,Args... args){return max(a, vamax(args...));} 
template<typename T,typename... Args>T vamin(T &a,Args... args){return min(a, vamin(args...));}