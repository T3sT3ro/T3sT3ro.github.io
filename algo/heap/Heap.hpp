#pragma once

#include <string>
#include <sstream>
#include <iterator>
#include <algorithm>

template<typename T>
class Heap {
public:

	//initialization
	//Heap<T>& operator=(Heap<T>& A) {
	//	swap(A);
	//	return *this;
	//}
	Heap() {
		_V = std::vector<T>(1);
		_size = 0;
	}
	Heap(const std::vector<T>& val) {
		_V = std::vector<T>(val.size() + 1);
		_size = val.size();
		for (unsigned int i = 0; i < val.size(); i++) _V[i + 1] = val[i];
		_heapify(val);
	}
	Heap(const Heap<T>&) = default;
	~Heap() = default;

	//information
	bool isEmpty() const;
	unsigned int size() const;
	T getMin() const;
	std::string toString();
	void pretty();

	//modification
	void insert(const T& val);
	T extractMin();
	void deleteMin();
	void clear();

private:
	std::vector<T>  _V;
	unsigned int _size;

	//internal
	void _heapify(const std::vector<T>& val);
	void _bubbleUp(const unsigned int& index);
	void _bubbleDown(const unsigned int& index);
};









// ==================
//	 internal
// ==================

template<typename T>
void Heap<T>::_heapify(const std::vector<T>& val) {
	for (int i = _size; i > 0; i--)
		_bubbleDown(i);
}

template<typename T>
void Heap<T>::_bubbleUp(const unsigned int& index) {
	if (index > _size || index < 2) return;
	if (_V[index] < _V[index / 2]) {
		swap(_V[index], _V[index / 2]);
		_bubbleUp(index / 2);
	}
}

template<typename T>
void Heap<T>::_bubbleDown(const unsigned int& index) {
	if (index < 1 || 2 * index > _size) return;
	unsigned int child = index * 2;
	if (child < _size && _V[child + 1] < _V[child]) child++;
	if (_V[child] < _V[index]) {
		swap(_V[index], _V[child]);
		_bubbleDown(child);
	}
}









// ==================
//	 initialization
// ==================









// ==================
//	 modification
// ==================

template<typename T>
inline void Heap<T>::insert(const T& val) {
	_V.emplace_back(val);
	_size++;
	_bubbleUp(_size);
}

template<typename T>
inline T Heap<T>::extractMin() {
	if (isEmpty())
		throw (std::string)"!!! Cannot extract min on empty heap.";
	try {
		T x = getMin();
		deleteMin();
		return x;
	}
	catch (std::string w) {
		throw w;
	}
}

template<typename T>
inline void Heap<T>::deleteMin() {
	if (isEmpty())
		throw (std::string)"!!! Cannot delete min on empty heap.";
	_V[1] = _V.back();
	_V.pop_back();
	_size--;
	_bubbleDown(1);
}

template<typename T>
void Heap<T>::clear() {
	_V.clear();
	_V = std::vector<T>(1);
	_size = 0;
}







// ==================
//	 information
// ==================
template<typename T>
bool Heap<T>::isEmpty() const {
	return _size == 0;
}

template<typename T>
unsigned int Heap<T>::size() const {
	return _size;
}

template<typename T>
T Heap<T>::getMin() const {
	if (isEmpty())
		throw (std::string)"!!! Cannot find min on empty heap.";
	return _V[1];
}

template<typename T>
std::string Heap<T>::toString() {
	if (isEmpty()) return "";
	std::ostringstream oss;
	copy(_V.begin() + 1, _V.end() - 1, std::ostream_iterator<int>(oss, ", "));
	oss << *(_V.end() - 1);
	return oss.str();
}

template<typename T>
void Heap<T>::pretty() {
	try {
		if (isEmpty()) std::cout << "EMPTY" << std::endl;
		std::cout << " size:" << size() << " isEmpty:" << isEmpty() << " min:" << (int)getMin() << std::endl;
		int p = 0;
		for (unsigned int i = 1; i <= _size; i++) {
			if (i == 2 || i == 4 || i == 8 || i == 16 || i == 32 || i == 64 || i == 128) std::cout << std::endl;
			std::cout << _V[i] << " | ";
		}
		std::cout << endl;
	}
	catch (std::string w) {
		std::cout << w << std::endl;
		return;
	}
}