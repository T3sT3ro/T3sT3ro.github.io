#include <iostream>
#include <string>
#include <vector>
#include <functional>
#include "Heap.hpp"
#include "MinMaxHeap.hpp"

//#include <gtest\gtest.h>

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
	try {
		cout << "6# clear test" << endl;
		vector<int> V = { 56,2,5,8,3,1,23,4,6,7 };
		Heap<int> h1(V);
		h1.pretty();
		h1.clear();
		h1.pretty();
	}
	catch (string w) {
		cout << w << endl;
	}
	return;
}

void test7() {
	try {
		cout << "7# getMin on empty" << endl;
		Heap<int> h1;
		h1.pretty();
	}
	catch (string w) { cout << w << endl; }
	return;
}

void test2_1() {
	cout << "1# construct from vector with unique values, extract all Min, extract all max" << endl;
	vector<int> V = { 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31 };
	random_shuffle(V.begin(), V.end());
	MinMaxHeap<int> h1 = V;
	h1 = V;
	h1.pretty();
	while (!h1.isEmpty())
		printf("min: %d\n", h1.extractMin());
	h1 = V;
	while (!h1.isEmpty())
		printf("max: %d\n", h1.extractMax());
	h1 = V;
	vector<int> V2 = h1.getContainer();
	try {
		while (!h1.isEmpty()) {
			printf("min: %d\n", h1.extractMin());
			printf("max: %d\n", h1.extractMax());
		}
	}
	catch (string w) { cout << w << endl; }

	return;
}

void test2_interactive() {
	cout << "2# interactive test" << endl;
	MinMaxHeap<int> H;
	cout << "operations:" << endl << "insert <val> ; min ; max ; exmin ; exmax ; delmin ; delmax ; clear ; size ; empty ; tostring ; pretty ; exit" << endl;
	cout << "To enable/disable auto pretty() function, use type 'autopretty'. Disabled by default" << endl;
	bool AUTOPRETTY = false;
	while (true) {
		try {
			string querry;
			int val;
			cout << "$ ";
			cin >> querry;
			if (querry == "insert") {
				cin >> val;
				H.insert(val);
			}
			else if (querry == "min") cout << H.getMin() << endl;
			else if (querry == "max") cout << H.getMax() << endl;
			else if (querry == "exmin") cout << H.extractMin() << endl;
			else if (querry == "exmax") cout << H.extractMax() << endl;
			else if (querry == "delmin") H.deleteMin();
			else if (querry == "delmax") H.deleteMax();
			else if (querry == "clear") H.clear();
			else if (querry == "size") cout << H.size() << endl;
			else if (querry == "empty") cout << H.isEmpty() << endl;
			else if (querry == "tostring") cout << H.toString() << endl;
			else if (querry == "pretty") H.pretty();
			else if (querry == "exit") break;
			else if (querry == "autopretty") AUTOPRETTY = !AUTOPRETTY;
			if (querry != "pretty" && AUTOPRETTY) H.pretty();
		}
		catch (string w) { cout << w << endl; }
	}
}


int main(int argc, char* argv[]) {
	test1();
	test2();
	test3();
	test4();
	test5();
	test6();
	test7();
	test2_1();
	test2_interactive();
	return 0;
}