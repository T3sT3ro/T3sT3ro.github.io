__CHECKER__ by Tooster manual

1. put program to be checked inside prog.cpp
2. inside brute.cpp put program to generate correct answers
3. put your test generator inside generator.cpp:
   generator takes 2 parameters: seed, a, b:
   * use seed in random number generator;
   * use a and b as limit range [a, b] for generated cases
	example below generates random permutation of n numbers, where n is between [a, b]:
	```c++
	int seed, A, B;
	vector<int> V;
	scanf("%d %d %d", &seed, &A, &B);
	srand(seed);
	int n = rand() % (B + 1 - A) + A;
	for (int i = 0; i < n; i++) V.push_back(i);
	random_shuffle(V.begin(), V.end());
	printf("%d\n", n);
	for (int i = 0; i < n; i++) printf("%d ", V[i]);
	return 0;
	```
4. run ./checker.sh to generate tests, compile programs and run them on test cases __OR__ generate tests with ./generate.sh and test with ./test.sh separately
