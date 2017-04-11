#pragma once

#include <string>
#include <sstream>
#include <iterator>
#include <algorithm>
#include "Heap.hpp"


////////////////////////////////////////////////////////////////////////////////////////////////////
/// @class		MinMaxHeap
///
/// @brief		A MinMaxHeap implementation in c++.
/// @details	MinMaxHeap represented as binary tree in vector.Optimized implementation that uses
/// 			iterative versions of TrickleUp() and TrickleDown() instead of recursive.
/// 			Additionally instead of swpas uses overriding and carry to mentain inner heap structure.
/// 			Lots of 'this' keyword to prevent gcc compiler errors (Visual Studio 2015 handles it).
///
/// @author		Tooster
/// @date		2017-04-07
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
		this->V_ = std::vector<T>(0);
		this->size_ = 0;
	}		// default constructor
	MinMaxHeap(const std::vector<T>& val) {					// constructor with vector<V> as param
		this->V_ = val;
		this->size_ = this->V_.size();
		this->heapify_(this->V_);
	}
	MinMaxHeap(const MinMaxHeap<T, Compare>&) = default;
	~MinMaxHeap() = default;

	//information

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	T MinMaxHeap::getMax() const;
	///
	/// @brief			Gets the max value in MinMaxHeap.
	/// @return			the biggest value in MinMaxHeap (bigger falue at second level in heap)
	////////////////////////////////////////////////////////////////////////////////////////////////////

	T getMax() const;

	//modyfication

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline void MinMaxHeap::insert(const T& val);
	///
	/// @brief			Inserts the given value.
	/// @param	val		The value.
	////////////////////////////////////////////////////////////////////////////////////////////////////

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
	/// @brief			Deletes the maximum element.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline void deleteMax();
};










// ==================
//	 internal
// ==================

template<class T, class Compare>
inline void MinMaxHeap<T, Compare>::heapify_(const std::vector<T>& val) {
	for (int i = this->size_ / 2; i >= 0; i--)
		trickleDown_(i);
}

template<class T, class Compare>
void MinMaxHeap<T, Compare>::trickleUp_(const int& index) {
	if (!this->valid_(index)) throw (std::string)("Index argument in trickleDown_ is outsite the MinMaxHeap range.");

	int currentNode = index;
	int ancestor = this->parent_(currentNode);
	if (!this->valid_(ancestor)) return;

	bool MINFLAG = isMinLevel_(currentNode);
	T val = this->V_[currentNode];

	if (this->valid_(ancestor) && this->compare_(val, this->V_[ancestor]) ^ MINFLAG) {
		this->V_[currentNode] = this->V_[ancestor];
		currentNode = ancestor;
		MINFLAG = !MINFLAG;
	}
	ancestor = this->parent_(this->parent_(currentNode));

	while (this->valid_(ancestor) && this->compare_(this->V_[ancestor], val) ^ MINFLAG) {
		this->V_[currentNode] = this->V_[ancestor];
		currentNode = ancestor;			// currentNode will be always valid cuz child was valid
		ancestor = this->parent_(this->parent_(currentNode));
	}

	if (currentNode != index)	// to prevent overriding element with itself
		this->V_[currentNode] = val;
}

template<class T, class Compare>
void MinMaxHeap<T, Compare>::trickleDown_(const int &index) {
	if (!this->valid_(index)) throw (std::string)("Index argument in trickleDown_ is outsite the MinMaxHeap range.");

	int child = this->leftSon_(index);
	if (!this->valid_(child)) return;

	bool MINFLAG = isMinLevel_(index);
	int currentNode = index;
	T val = this->V_[currentNode];

	while (this->valid_(child)) {
		if (this->valid_(this->rightSon_(currentNode)) && this->compare_(this->V_[child], this->V_[this->rightSon_(currentNode)]) ^ MINFLAG) child = this->rightSon_(currentNode);
		for (int i = this->leftSon_(this->leftSon_(currentNode)); this->valid_(i) && i < this->leftSon_(this->leftSon_(currentNode)) + 4; i++) {
			if (this->valid_(i) && this->compare_(this->V_[child], this->V_[i]) ^ MINFLAG) child = i;
		}

		if (this->parent_(child) == currentNode && this->compare_(val, this->V_[child]) ^ MINFLAG) {
			this->V_[currentNode] = this->V_[child];
			this->V_[child] = val;
			currentNode = child;
			break;
		}

		else if (this->parent_(this->parent_(child)) == currentNode && this->compare_(val, this->V_[child]) ^ MINFLAG) {
			this->V_[currentNode] = this->V_[child];
			if (this->valid_(this->parent_(child)) && this->compare_(val, this->V_[this->parent_(child)]) ^ MINFLAG) {
				this->V_[child] = this->V_[this->parent_(child)];
				this->V_[this->parent_(child)] = val;
				val = this->V_[child];
			}
			currentNode = child;			// currentNode will be always valid cuz child was valid
			child = this->leftSon_(currentNode);
		}
		else break;
	}
	if (this->V_[currentNode] != val)
		this->V_[currentNode] = val;
}

template<class T, class Compare>
inline bool MinMaxHeap<T, Compare>::isMinLevel_(const int& index) {
	return (this->lvl_(index) & 1) == 0;
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
	switch (this->size_) {
	case 0:
		throw (std::string)"Cannot find min on empty MinMaxHeap.";
	case 1:
		return this->V_[0];
	case 2:
		return this->V_[1];
	default:
		return this->compare_(this->V_[1], this->V_[2]) ? this->V_[2] : this->V_[1];
	}
}

template<class T, class Compare>
inline void MinMaxHeap<T, Compare>::insert(const T& val) {
	this->V_.emplace_back(val);
	this->size_++;
	trickleUp_(this->size_ - 1);
}

template<class T, class Compare>
inline T MinMaxHeap<T, Compare>::extractMin() {
	if (this->isEmpty())
		throw (std::string)"Cannot extract min on empty MinMaxHeap.";
	try {
		T x = this->getMin();
		this->deleteMin();
		return x;
	}
	catch (std::string w) {
		throw w;
	}
}

template<class T, class Compare>
inline T MinMaxHeap<T, Compare>::extractMax() {
	if (this->isEmpty())
		throw (std::string)"Cannot extract max on empty MinMaxHeap.";
	try {
		T x = getMax();
		this->deleteMax();
		return x;
	}
	catch (std::string w) {
		throw w;
	}
}

template<class T, class Compare>
inline void MinMaxHeap<T, Compare>::deleteMin() {
	if (this->isEmpty())
		throw (std::string)"Cannot delete min on empty MinMaxHeap.";
	this->V_[0] = this->V_.back();
	this->V_.pop_back();
	this->size_--;
	if (!this->isEmpty())
		trickleDown_(0);
}

template<class T, class Compare>
inline void MinMaxHeap<T, Compare>::deleteMax() {
	if (this->isEmpty())
		throw (std::string)"Cannot delete max on empty MinMaxHeap.";
	if (this->size_ <= 2) {
		this->V_.pop_back();
		this->size_--;
	}
	else {
		if (this->compare_(this->V_[2], this->V_[1])) {
			this->V_[1] = this->V_.back();
			this->V_.pop_back();
			this->size_--;
			trickleDown_(1);
		}
		else {
			this->V_[2] = this->V_.back();
			this->V_.pop_back();
			this->size_--;
			if (this->valid_(2)) trickleDown_(2);
		}
	}
}

// ==================
//	 information
// ==================