#include <cstdio>
#include <random>
#include <ctime>
#include <vector>
#include <algorithm>

using namespace std;

vector<int> V;
int main() {
	int seed, A, B;
	scanf("%d %d %d", &seed, &A, &B);
	srand(seed);
	int n = rand() % (B + 1 - A) + A;
	for (int i = 0; i < n; i++) V.push_back(i);
	random_shuffle(V.begin(), V.end());
	printf("%d\n", n);
	for (int i = 0; i < n; i++) printf("%d ", V[i]);
	return 0;
}