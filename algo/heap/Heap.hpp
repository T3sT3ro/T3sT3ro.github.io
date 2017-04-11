#pragma once

#include <string>
#include <sstream>
#include <iterator>
#include <algorithm>
#include <iostream>
#include <cstdio>
#include <functional>



////////////////////////////////////////////////////////////////////////////////////////////////////
/// @class	Heap
///
/// @brief	A Heap implementation in c++.
/// 		To compile without errors use -std=c++11 flag.
///
/// @author	Tooster
/// @date	2017-04-07
////////////////////////////////////////////////////////////////////////////////////////////////////

template<class T, class Compare = std::less<T> >
class Heap {
protected:
	/// @brief	The container
	std::vector<T>  V_;
	/// @brief	The size
	int size_;
	/// @brief	The compare function
	Compare compare_;

	//internal

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void Heap::heapify_(const std::vector<T>& val);
	///
	/// @brief			Turns vector into heap.
	/// @param	val		Vector of type T
	////////////////////////////////////////////////////////////////////////////////////////////////////
	inline void heapify_(const std::vector<T>& val);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void Heap::bubbleUp_(const int& index);
	///
	/// @brief			Swaps node with parent.
	/// @param	index	index of element to start with
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void bubbleUp_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void Heap::bubbleDown_(const int& index);
	///
	/// @brief			Swaps node with it's min child.
	/// @param	index	index of element to start with
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void bubbleDown_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline bool Heap::valid_(const int& index);
	///
	/// @brief	Checks if index is within range [0, size_).
	/// @param	index	index to be checked.
	///
	/// @return	true if index is valid, false in other case.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline bool valid_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline int Heap::parent_(const int& index);
	///
	/// @brief			Returns index of parent of the element at given index.
	/// @param	index	index of an element to be checked
	///
	/// @return			Parent's index, -1 if it doesn't exist
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline int parent_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline int Heap::leftSon_(const int& index);
	///
	/// @brief			Returns an index of left child of an element.
	/// @param	index	index of an element to be checked
	///
	/// @return			left child's index, -1 if it doesn' exist
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline int leftSon_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline int Heap::rightSon_(const int& index);
	///
	/// @brief			Returns an index of right child of an element.
	/// @param	index	index of an element to be checked
	///
	/// @return			right child's index, -1 if it doesn't exist
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline int rightSon_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline int Heap::minSon_(const int &index);
	///
	/// @brief			Returns index of son with son with smaler value(according to compare function).
	/// @param	index	index of the node
	///
	/// @return			index of smallest son, -1 if none.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline int minSon_(const int& index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	inline int Heap::minElement_(const int& index1, const int& index2);
	///
	/// @brief			returns index to element with lower value, -1 if none is found.
	/// @param	index1	The first index.
	/// @param	index2	The second index.
	///
	/// @return			index to smaller element, -1 if none
	////////////////////////////////////////////////////////////////////////////////////////////////////

	inline int minElement_(const int& index1, const int& index2);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	int Heap::lvl_(int index);
	///
	/// @brief			Returns a level in a heap of the index: lvl_(0)=0; lvl_(1)=lvl__(2)=1; etc.
	/// @param	index	the index
	///
	/// @return			an int from [0, log2(MAXINT_)]
	////////////////////////////////////////////////////////////////////////////////////////////////////

	int lvl_(int index);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void Heap::drawSegment_(int partWidth, bool nodeLine, int index) public: Heap() : V_
	///
	/// @brief				Internal helper function for pretty().
	/// @param	partWidth	Width of the part.
	/// @param	nodeLine 	is it a line with a node element
	/// @param	index	 	index to the V_ cotainer
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void drawSegment_(int partWidth, bool nodeLine, int index);
public:


	//initialization
	Heap() : V_{ std::vector<T>(0) }, size_{ 0 } {}		// default constructor
	Heap(const std::vector<T>& val) {					// constructor with vector<V> as param
		V_ = val;
		size_ = V_.size();
		heapify_(V_);
	}
	Heap(const Heap<T, Compare>&) = default;
	~Heap() = default;

	//information

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	bool Heap::isEmpty() const;
	///
	/// @brief			Query if this object is empty.
	///
	/// @return			True if empty, false if not.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	bool isEmpty() const;

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	int Heap::size() const;
	///
	/// @brief			Gets the size of the Heap.
	///
	/// @return			int size
	////////////////////////////////////////////////////////////////////////////////////////////////////

	int size() const;

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	T Heap::getMin() const;
	///
	/// @brief			Gets the min element int the Heap.
	///
	/// @return			root element in Heap according to compare function (default - min).
	////////////////////////////////////////////////////////////////////////////////////////////////////

	T getMin() const;

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	vector<T> Heap::getContainer() const;
	///
	/// @brief	Returns the container.
	/// @return	the container
	////////////////////////////////////////////////////////////////////////////////////////////////////

	std::vector<T> getContainer() const;

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	std::string Heap::toString();
	///
	/// @brief			Convert this object into a string representation.
	///
	/// @return			std::string that represents this object.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	std::string toString();

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void Heap::pretty();
	///
	/// @brief			Prints the content of the Heap, where first line contains.
	/// 				elements of the level_0, second - level_1 etc.
	///
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void pretty();

	//modification

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void Heap::insert(const T& val);
	///
	/// @brief			Inserts the given value.
	///
	/// @param	val		the value.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void insert(const T& val);

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	T Heap::extractMin();
	///
	/// @brief			Removes root element from Heap and returns it.
	///
	/// @return			the root element.
	////////////////////////////////////////////////////////////////////////////////////////////////////

	T extractMin();

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void Heap::deleteMin();
	///
	/// @brief			Removes root element from Heap.
	///
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void deleteMin();

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// @fn	void Heap::clear();
	///
	/// @brief			Clears Heap to its blank/initial state.
	///
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void clear();
};










// ==================
//	 internal
// ==================

template<class T, class Compare >
inline void Heap<T, Compare>::heapify_(const std::vector<T>& val) {
	for (int i = size_ / 2; i >= 0; i--)
		bubbleDown_(i);
}

template<class T, class Compare>
void Heap<T, Compare>::bubbleUp_(const int& index) {
	if (!valid_(index)) throw (std::string)("Index argument in bubbleDown_ is outsite the Heap range.");

	int currentNode = index;
	int parent = parent_(currentNode);
	if (!valid_(parent)) return;
	T val = V_[currentNode];

	while (valid_(parent) && compare_(val, V_[parent])) {
		V_[currentNode] = V_[parent];
		currentNode = parent;			// currentNode will be always valid cuz child was valid
		parent = parent_(currentNode);
	}
	if (currentNode != index)	// to prevent overriding element with itself
		V_[currentNode] = val;
}

template<class T, class Compare>
void Heap<T, Compare>::bubbleDown_(const int &index) {
	if (!valid_(index)) throw (std::string)("Index argument in bubbleDown_ is outsite the Heap range.");

	int currentNode = index;
	int child = minSon_(currentNode);
	if (!valid_(child)) return;
	T val = V_[currentNode];

	while (valid_(child) && compare_(V_[child], val)) {
		V_[currentNode] = V_[child];
		currentNode = child;			// currentNode will be always valid cuz child was valid
		child = minSon_(currentNode);
	}
	if (currentNode != index)	// to prevent overriding element with itself
		V_[currentNode] = val;
}

template<class T, class Compare>
inline bool Heap<T, Compare>::valid_(const int& index) {
	return (index < (int)size_ && index >= 0);
}

template<class T, class Compare>
inline int Heap<T, Compare>::parent_(const int& index) {
	if (!valid_(index) || index <= 0) return -1;
	return ((index + 1) / 2) - 1;
}

template<class T, class Compare>
inline int Heap<T, Compare>::leftSon_(const int& index) {
	if (!valid_(index)) return -1;
	int child = (index + 1) * 2 - 1;
	return valid_(child) ? child : -1;
}

template<class T, class Compare>
inline int Heap<T, Compare>::rightSon_(const int& index) {
	if (!valid_(index)) return -1;
	int child = (index + 1) * 2;
	return valid_(child) ? child : -1;
}

template<class T, class Compare>
inline int Heap<T, Compare>::minSon_(const int& index) {
	if (!valid_(index)) throw (std::string)("Index argument in minSon_ is outsite the Heap range.");
	return minElement_(leftSon_(index), rightSon_(index));
}

template<class T, class Compare>
inline int Heap<T, Compare>::minElement_(const int& index1, const int& index2) {
	int descendant = -1;
	if (valid_(index1)) descendant = index1;
	if (valid_(descendant) && valid_(index2) && compare_(V_[index2], V_[descendant])) descendant = index2;
	return descendant;
}

template<class T, class Compare>
int Heap<T, Compare>::lvl_(int index) {
	int p = -1; index++;
	while (index) { p++; index >>= 1; }
	return p;
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
inline void Heap<T, Compare>::insert(const T& val) {
	V_.emplace_back(val);
	size_++;
	bubbleUp_(size_ - 1);
}

template<class T, class Compare>
inline T Heap<T, Compare>::extractMin() {
	if (isEmpty())
		throw (std::string)"Cannot extract min on empty Heap.";
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
inline void Heap<T, Compare>::deleteMin() {
	if (isEmpty())
		throw (std::string)"Cannot delete min on empty Heap.";
	V_[0] = V_.back();
	V_.pop_back();
	size_--;
	if (!isEmpty()) bubbleDown_(0);
}

template<class T, class Compare>
void Heap<T, Compare>::clear() {
	V_.clear();
	size_ = 0;
}

// ==================
//	 information
// ==================
template<class T, class Compare>
bool Heap<T, Compare>::isEmpty() const {
	return size_ == 0;
}

template<class T, class Compare>
int Heap<T, Compare>::size() const {
	return size_;
}

template<class T, class Compare>
T Heap<T, Compare>::getMin() const {
	if (isEmpty())
		throw (std::string)"Cannot find min on empty Heap.";
	return V_[0];
}

template<class T, class Compare>
std::vector<T> Heap<T, Compare>::getContainer() const {
	return V_;
}

template<class T, class Compare>
std::string Heap<T, Compare>::toString() {
	if (isEmpty()) return "";
	std::ostringstream oss;
	copy(V_.begin(), V_.end() - 1, std::ostream_iterator<int>(oss, ","));
	oss << *(V_.end() - 1);
	return oss.str();
}

template<class T, class Compare>
void Heap<T, Compare>::drawSegment_(int partWidth, bool nodeLine, int index) {
	for (int i = 0; i < partWidth; i++) std::printf("     ");
	valid_(leftSon_(index)) ?
		(nodeLine ? std::printf("  .--") : std::printf("  |  "))
		: std::printf("     ");
	for (int i = 0; i < partWidth; i++)
		nodeLine ? std::printf("-----") : std::printf("     ");
	nodeLine ? std::printf("(%03d)", V_[index]) : std::printf("     ");
	for (int i = 0; i < partWidth; i++)
		nodeLine ? std::printf("-----") : std::printf("     ");
	valid_(rightSon_(index)) ?
		(nodeLine ? std::printf("--.  ") : std::printf("  |  "))
		: std::printf("     ");
	for (int i = 0; i < partWidth; i++) std::printf("     ");
}

template<class T, class Compare>
void Heap<T, Compare>::pretty() {
	try {
		std::cout << std::endl;
		if (isEmpty()) {
			std::cout << "EMPTY" << std::endl;
			return;
		}
		std::cout << " size:" << size() << " min:" << (int)getMin() << std::endl;

		int depth = lvl_(size_ - 1);
		int node = 0, helper = 0;
		int off = 1 << depth;
		for (int i = 1; i <= depth; i++) {
			for (int j = 0; j < (1 << (i - 1)); j++) {
				drawSegment_((off >> i) - 1, true, node++);
				std::printf("     ");
			}
			std::printf("\n");
			for (int j = 0; j < (1 << (i - 1)); j++) {
				drawSegment_((off >> i) - 1, false, helper++);
				std::printf("     ");
			}
			std::printf("\n");
		}
		while (node < size_) {
			std::printf("(%03d)", V_[node++]);
			std::printf("     ");
		}
		std::printf("\n");
	}

	catch (std::string w) {
		throw w;
	}
}