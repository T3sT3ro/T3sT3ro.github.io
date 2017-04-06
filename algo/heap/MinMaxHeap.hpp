#pragma once

#include <string>
#include <sstream>
#include <iterator>
#include <algorithm>
#include "Heap.hpp"


////////////////////////////////////////////////////////////////////////////////////////////////////
/// @class	MinMaxHeap
///
/// @brief	A MinMaxHeap implementation in c++.
///
/// @author	Tooster
/// @date	2017-04-07
////////////////////////////////////////////////////////////////////////////////////////////////////


template<class T, class Compare = std::less<T> >
class MinMaxHeap : public Heap<T, Compare> {
protected:

	inline void heapify_(const std::vector<T>& val);
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void MinMaxHeap::trickleUp_(const int& index);
	///
	/// @brief			Mentains heap-ordering from index to leaves
	/// @param	index	index to start with
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void trickleUp_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void MinMaxHeap::trickleDown_(const int& index);
	///
	/// @brief			Mentains heap-ordering from index to root
	/// @param	index	index to start with
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void trickleDown_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	bool MinMaxHeap::isMinLevel_(int index);
	///
	/// @brief			Checks if index is on min(even) level. (i.e index 0 is on min level)
	/// @param	index	the index
	///
	/// @return			true if index is on min(even) level, false if not
	////////////////////////////////////////////////////////////////////////////////////////////////////

	bool isMinLevel_(const int& index);

public:


	//initialization
	MinMaxHeap() {
		V_ = std::vector<T>(0);
		size_ = 0;
	}		// default constructor
	MinMaxHeap(const std::vector<T>& val) {					// constructor with vector<V> as param
		V_ = val;
		size_ = V_.size();
		heapify_(V_);
	}
	MinMaxHeap(const MinMaxHeap<T, Compare>&) = default;
	~MinMaxHeap() = default;

	//information
	T getMax() const;

	//modyfication
	inline void insert(const T& val);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline T	MinMaxHeap::extractMin();
	/// @see			Heap::extractMin();
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline T extractMin();

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline T	MinMaxHeap::extractMax();
	/// @brief			analogue to extractMin();
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline T extractMax();

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline void MinMaxHeap::deleteMin();
	///
	/// @brief			Deletes the minimum element.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline void deleteMin();

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline void MinMaxHeap::deleteMax();
	///
	/// @brief	Deletes the maximum element.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline void deleteMax();
};










// ==================
//	 internal
// ==================

template<class T, class Compare = std::less<T> >
inline void MinMaxHeap<T, Compare>::heapify_(const std::vector<T>& val) {
	for (int i = size_ / 2; i >= 0; i--)
		trickleDown_(i);
}

template<class T, class Compare = std::less<T> >
void MinMaxHeap<T, Compare>::trickleUp_(const int& index) {
	if (!valid_(index)) throw (std::string)("Index argument in trickleDown_ is outsite the MinMaxHeap range.");

	int currentNode = index;
	int ancestor = parent_(currentNode);
	if (!valid_(ancestor)) return;

	bool MINFLAG = isMinLevel_(currentNode);
	T val = V_[currentNode];

	if (valid_(ancestor) && compare_(val, V_[ancestor]) ^ MINFLAG) {
		V_[currentNode] = V_[ancestor];
		currentNode = ancestor;
		MINFLAG = !MINFLAG;
	}
	ancestor = parent_(parent_(currentNode));

	while (valid_(ancestor) && compare_(V_[ancestor], val) ^ MINFLAG) {
		V_[currentNode] = V_[ancestor];
		currentNode = ancestor;			// currentNode will be always valid cuz child was valid
		ancestor = parent_(parent_(currentNode));
	}

	if (currentNode != index)	// to prevent overriding element with itself
		V_[currentNode] = val;
}

template<class T, class Compare = std::less<T> >
void MinMaxHeap<T, Compare>::trickleDown_(const int &index) {
	if (!valid_(index)) throw (std::string)("Index argument in trickleDown_ is outsite the MinMaxHeap range.");

	int child = leftSon_(index);
	if (!valid_(child)) return;

	bool MINFLAG = isMinLevel_(index);
	int currentNode = index;
	T val = V_[currentNode];

	while (valid_(child)) {
		if (valid_(rightSon_(currentNode)) && compare_(V_[child], V_[rightSon_(currentNode)]) ^ MINFLAG) child = rightSon_(currentNode);
		for (int i = leftSon_(leftSon_(currentNode)); valid_(i) && i < leftSon_(leftSon_(currentNode)) + 4; i++) {
			if (valid_(i) && compare_(V_[child], V_[i]) ^ MINFLAG) child = i;
		}

		if (parent_(child) == currentNode && compare_(val, V_[child]) ^ MINFLAG) {
			V_[currentNode] = V_[child];
			V_[child] = val;
			currentNode = child;
			break;
		}

		else if (parent_(parent_(child)) == currentNode && compare_(val, V_[child]) ^ MINFLAG) {
			V_[currentNode] = V_[child];
			if (valid_(parent_(child)) && compare_(val, V_[parent_(child)]) ^ MINFLAG) {
				V_[child] = V_[parent_(child)];
				V_[parent_(child)] = val;
				val = V_[child];
			}
			currentNode = child;			// currentNode will be always valid cuz child was valid
			child = leftSon_(currentNode);
		}
		else break;
	}
	if (V_[currentNode] != val)
		V_[currentNode] = val;
}

template<class T, class Compare>
inline bool MinMaxHeap<T, Compare>::isMinLevel_(const int& index) {
	return (lvl_(index) & 1) == 0;
}

//
//     PPPPPP   UUU   UUU  BBBBBBB   LLL      III    CCCCC
//	   PPPPPPP  UUU   UUU  BBBBBBBB  LLL      III  CCCCCCC
//     PPPPPP   UUU   UUU  BBBBBBB   LLL      III  CCC
//     PPP      UUU   UUU  BBBBBBB   LLL      III  CCC
//     PPP      UUU   UUU  BBBBBBBB  LLL      III  CCC
//     PPP      UUUUUUUUU  BBBBBBBB  LLLLLLL  III  CCCCCCC
//     PPP       UUUUUUU   BBBBBBB   LLLLLLL  III    CCCCC



// ==================
//	 modification
// ==================

template<class T, class Compare>
T MinMaxHeap<T, Compare>::getMax() const {
	switch (size_) {
	case 0:
		throw (std::string)"Cannot find min on empty MinMaxHeap.";
	case 1:
		return V_[0];
	case 2:
		return V_[1];
	default:
		return compare_(V_[1], V_[2]) ? V_[2] : V_[1];
	}
}

template<class T, class Compare = std::less<T> >
inline void MinMaxHeap<T, Compare>::insert(const T& val) {
	V_.emplace_back(val);
	size_++;
	trickleUp_(size_ - 1);
}

template<class T, class Compare = std::less<T> >
inline T MinMaxHeap<T, Compare>::extractMin() {
	if (isEmpty())
		throw (std::string)"Cannot extract min on empty MinMaxHeap.";
	try {
		T x = getMin();
		deleteMin();
		return x;
	}
	catch (std::string w) {
		throw w;
	}
}

template<class T, class Compare>
inline T MinMaxHeap<T, Compare>::extractMax() {
	if (isEmpty())
		throw (std::string)"Cannot extract max on empty MinMaxHeap.";
	try {
		T x = getMax();
		deleteMax();
		return x;
	}
	catch (std::string w) {
		throw w;
	}
}

template<class T, class Compare = std::less<T> >
inline void MinMaxHeap<T, Compare>::deleteMin() {
	if (isEmpty())
		throw (std::string)"Cannot delete min on empty MinMaxHeap.";
	V_[0] = V_.back();
	V_.pop_back();
	size_--;
	if (!isEmpty())
		trickleDown_(0);
}

template<class T, class Compare>
inline void MinMaxHeap<T, Compare>::deleteMax() {
	if (isEmpty())
		throw (std::string)"Cannot delete max on empty MinMaxHeap.";
	if (size_ <= 2) {
		V_.pop_back();
		size_--;
	}
	else {
		if (compare_(V_[2], V_[1])) {
			V_[1] = V_.back();
			V_.pop_back();
			size_--;
			trickleDown_(1);
		}
		else {
			V_[2] = V_.back();
			V_.pop_back();
			size_--;
			if (valid_(2)) trickleDown_(2);
		}
	}
}

// ==================
//	 information
// ==================