#include <iostream>
#include <string>
#include <vector>
#include "Heap.hpp"

using namespace std;

void test1() {
	cout << "1# constructheap from vector" << endl;
	vector<int> V = { 56,2,5,8,3,1,23,4,6,7 };
	Heap<int> h(V);
	cout << h.toString() << endl;
	h.pretty();
	return;
}

void test2() {
	cout << "2# assignment test h1= h2" << endl;
	vector<int> V = { 56,2,5,8,3,1,23,4,6,7 };
	Heap<int> h1(V);
	vector<int> K = { 1,2,3,4,5 };
	Heap<int> h2(K);
	h1.pretty(); h2.pretty();
	h1 = h2;
	h1.pretty(); h2.pretty();
	return;
}

void test3() {
	cout << "3# construct from heap" << endl;
	vector<int> V = { 56,2,5,8,3,1,23,4,6,7 };
	Heap<int> h1(V);
	Heap<int> h2(h1);
	h1.pretty();
	h2.pretty();
	return;
}

void test4() {
	cout << "4# multiple insertions" << endl;
	vector<int> V = { 56,2,5,8,3,1,23,4,6,7 };
	Heap<int> h1(V);
	h1.insert(5);
	h1.insert(2);
	h1.insert(17);
	h1.insert(100);
	h1.insert(3);
	h1.insert(6);
	h1.insert(24);
	h1.pretty();

	h1.clear();
	h1.insert(5);
	h1.insert(2);
	h1.insert(17);
	h1.insert(100);
	h1.insert(3);
	h1.insert(6);
	h1.insert(24);
	h1.pretty();

	return;
}

void test5() {
	try {
		cout << "5# insertions and deletions test" << endl;
		vector<int> V = { 56,2,5,8,3,1,23,4,6,7 };
		Heap<int> h1(V);
		h1.pretty();
		cout << (int)h1.extractMin() << endl;
		h1.insert(2);
		h1.insert(17);
		h1.insert(100);
		cout << h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		h1.insert(1);
		h1.insert(12);
		h1.insert(16);
		cout << (int)h1.extractMin() << endl;
		h1.insert(2);
		h1.insert(567);
		h1.insert(-50);
		h1.insert(2);
		h1.insert(18);
		h1.insert(-10);
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		h1.pretty();
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
		cout << (int)h1.extractMin() << endl;
	}
	catch (string w) {
		cout << w << endl;
	}
	return;
}

void test6() {
	cout << "6# clear test" << endl;
	vector<int> V = { 56,2,5,8,3,1,23,4,6,7 };
	Heap<int> h1(V);
	h1.pretty();
	h1.clear();
	h1.pretty();
	return;
}

void test7() {
	try {
		cout << "7# getMin on empty" << endl;
		Heap<int> h1;
		h1.pretty();
	}
	catch (string w) {
		cout << w << endl;
	}
	return;
}

int main() {
	test1();
	test2();
	test3();
	test4();
	test5();
	test6();
	test7();
	return 0;
}