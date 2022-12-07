class SegmentTree1 {
    constructor(array) {
        this.array = array;
        this.tree = new Array(4 * array.length);
    }

    build(node, start, end) {
        if (start === end) {
            this.tree[node] = this.array[start];
            return this.tree[node];
        }

        const mid = Math.floor((start + end) / 2);
        this.tree[node] = this.build(2 * node, start, mid) +
            this.build(2 * node + 1, mid + 1, end);

        return this.tree[node];
    }

    query(node, start, end, l, r) {
        if (r < start || end < l) {
            return 0;
        }

        if (l <= start && end <= r) {
            return this.tree[node];
        }

        const mid = Math.floor((start + end) / 2);
        return this.query(2 * node, start, mid, l, r) +
            this.query(2 * node + 1, mid + 1, end, l, r);
    }

    update(node, start, end, index, value) {
        if (index < start || end < index) {
            return this.tree[node];
        }

        if (start === end) {
            this.array[index] = value;
            this.tree[node] = value;
            return this.tree[node];
        }

        const mid = Math.floor((start + end) / 2);
        this.tree[node] = this.update(2 * node, start, mid, index, value) +
            this.update(2 * node + 1, mid + 1, end, index, value);

        return this.tree[node];
    }
}

/*
 
To call the build method on an instance of the SegmentTree class, you would use the following syntax:
 
*/
const array = [1, 2, 3, 4, 5];
const st = new SegmentTree1(array);
st.build(1, 0, array.length - 1);
/*
In this example, array is the array of values that you want to construct the segment tree from. The st variable is an instance of the SegmentTree class, which is initialized with the array of values. The build method is called on the st instance, with the arguments 1, 0, and array.length - 1, which specify the node, start index, and end index, respectively.
 
Once the build method has been called, the segment tree will be constructed and stored in the tree property of the st instance. You can then use the query and update methods to query or update the tree as needed.
 
Here is an example of using the query method to find the sum of the values in the range [1, 3]:
*/

sum = st.query(1, 0, array.length - 1, 1, 3);
console.log(sum); // Output: 6 (TTR: NOT, 0-based indexing vs 1-based)

// -----------------------------------------------------------------------------

class SegmentTree2 {
    constructor(array) {
        this.array = array;
        this.tree = new Array(4 * array.length);
        this.start = 0;
        this.end = array.length - 1;
    }

    build(node, start, end) {
        if (start === end) {
            this.tree[node] = this.array[start];
            return this.tree[node];
        }

        const mid = Math.floor((start + end) / 2);
        this.tree[node] = this.build(2 * node, start, mid) +
            this.build(2 * node + 1, mid + 1, end);

        return this.tree[node];
    }

    query(node, l, r) {
        if (r < this.start || this.end < l) {
            return 0;
        }

        if (l <= this.start && this.end <= r) {
            return this.tree[node];
        }

        const mid = Math.floor((this.start + this.end) / 2);
        return this.query(2 * node, l, r) +
            this.query(2 * node + 1, l, r);
    }

    update(node, index, value) {
        if (index < this.start || this.end < index) {
            return this.tree[node];
        }

        if (this.start === this.end) {
            this.array[index] = value;
            this.tree[node] = value;
            return this.tree[node];
        }

        const mid = Math.floor((this.start + this.end) / 2);
        this.tree[node] = this.update(2 * node, index, value) +
            this.update(2 * node + 1, index, value);

        return this.tree[node];
    }
}

// -----------------------------------------------------------------------------

class SegmentTree3 {
    constructor(data) {
        this.tree = this.buildTree(data);
    }

    buildTree(data) {
        const n = data.length;

        // The tree array will have a length of 2 * 2^ceil(log2(n)) - 1
        const maxTreeSize = 2 * Math.pow(2, Math.ceil(Math.log2(n))) - 1;
        this.tree = new Array(maxTreeSize);

        // Build the tree
        this.buildTreeRecursive(data, 0, n - 1, 0);

        return this.tree;
    }

    buildTreeRecursive(data, s, e, i) {
        // If there is only one element in the interval, store it in the tree
        if (s === e) {
            this.tree[i] = data[s];
            return data[s];
        }

        // Calculate the middle of the interval
        const middle = Math.floor((s + e) / 2);

        // Recursively build the left and right subtrees
        const leftSum = this.buildTreeRecursive(data, s, middle, 2 * i + 1);
        const rightSum = this.buildTreeRecursive(data, middle + 1, e, 2 * i + 2);

        // Combine the results and store them in the tree
        this.tree[i] = leftSum + rightSum;
        return this.tree[i];
    }

    query(l, r) {
        // Query the tree for the sum of the given range
        return this.queryRecursive(0, this.tree.length - 1, l, r, 0);
    }

    queryRecursive(s, e, l, r, i) {
        // If the queried range is completely outside the range represented by the current node, return 0
        if (l > e || r < s) {
            return 0;
        }

        // If the queried range is completely inside the range represented by the current node, return the value stored in the tree
        if (l <= s && r >= e) {
            return this.tree[i];
        }

        // If the queried range is partially inside and partially outside the range represented by the current node, recursively query the left and right subtrees
        const middle = Math.floor((s + e) / 2);
        const leftSum = this.queryRecursive(s, middle, l, r, 2 * i + 1);
        const rightSum = this.queryRecursive(middle + 1, e, l, r, 2 * i + 2);

        // Combine the results and return them
        return leftSum + rightSum;
    }

    update(index, value) {
        // Update the value of the element at the given index
        this.updateRecursive(0, this.tree.length - 1, index, value, 0);
    }

    updateRecursive(s, e, index, value, i) {
        // If the element at the given index is outside the range represented by the current node, do nothing
        if (index < s || index > e) {
            return;
        }

        // If there is only one element in the range represented by the current node, update the value and return
        if (s === e) {
            this.tree[i] = value;
            return;
        }

        // Calculate the middle of the interval
        const middle = Math.floor((s + e) / 2);

        // Recursively update the left and right subtrees
        this.updateRecursive(s, middle, index, value, 2 * i + 1);
        this.updateRecursive(middle + 1, e, index, value, 2 * i + 2);

        // Combine the results and update the value in the tree
        this.tree[i] = this.tree[2 * i + 1] + this.tree[2 * i + 2];
    }
}

data = [1, 2, 3, 4, 5, 6, 7, 8];
tree = new SegmentTree3(data);

console.log(tree.query(1, 3)); // 6 (sum of 2, 3, and 4)
tree.update(1, 10);
console.log(tree.query(1, 3)); // 15 (sum of 10, 3, and 4)

// -----------------------------------------------------------------------------

class SegmentTree4 {
    constructor(data) {
        this.tree = this.buildTree(data);
    }

    buildTree(data) {
        const n = data.length;
        const maxTreeSize = 2 * Math.pow(2, Math.ceil(Math.log2(n))) - 1;
        this.tree = new Array(maxTreeSize);
        this.buildTreeRecursive(data, 0, n - 1, 0);
        return this.tree;
    }

    buildTreeRecursive(data, s, e, i) {
        if (s === e) {
            this.tree[i] = data[s];
            return data[s];
        }

        const middle = Math.floor((s + e) / 2);
        const leftSum = this.buildTreeRecursive(data, s, middle, 2 * i + 1);
        const rightSum = this.buildTreeRecursive(data, middle + 1, e, 2 * i + 2);
        this.tree[i] = leftSum + rightSum;
        return this.tree[i];
    }

    query(l, r) {
        return this.queryRecursive(0, this.tree.length - 1, l, r, 0);
    }

    queryRecursive(s, e, l, r, i) {
        if (l > e || r < s) {
            return 0;
        }

        if (l <= s && r >= e) {
            return this.tree[i];
        }

        const middle = Math.floor((s + e) / 2);
        const leftSum = this.queryRecursive(s, middle, l, r, 2 * i + 1);
        const rightSum = this.queryRecursive(middle + 1, e, l, r, 2 * i + 2);
        return leftSum + rightSum;
    }

    update(index, value) {
        this.updateRecursive(0, this.tree.length - 1, index, value, 0);
    }

    updateRecursive(s, e, index, value, i) {
        if (index < s || index > e) {
            return;
        }

        if (s === e) {
            this.tree[i] = value;
            return;
        }

        const middle = Math.floor((s + e) / 2);
        this.updateRecursive(s, middle, index, value, 2 * i + 1);
        this.updateRecursive(middle + 1, e, index, value, 2 * i + 2);
        this.tree[i] = this.tree[2 * i + 1] + this.tree[2 * i + 2];
    }
}

data = [1, 2, 3, 4, 5, 6, 7, 8];
tree = new SegmentTree4(data);

console.log(tree.query(0, 2)); // 6 (sum of 1, 2, and 3)
tree.update(0, 10);
console.log(tree.query(0, 2)); // 15 (sum of 10, 2, and 3)

// -----------------------------------------------------------------------------

class SegmentTree5 {
    constructor(data) {
        this.data = data;
        this.n = data.length;
        this.tree = new Array(this.n * 4);
        this.lazy = new Array(this.n * 4);
        this.buildTree(0, 0, this.n - 1);
    }

    buildTree(node, start, end) {
        if (start === end) {
            this.tree[node] = this.data[start];
            return;
        }

        const mid = Math.floor((start + end) / 2);
        this.buildTree(node * 2 + 1, start, mid);
        this.buildTree(node * 2 + 2, mid + 1, end);
        this.tree[node] = this.tree[node * 2 + 1] + this.tree[node * 2 + 2];
    }

    updateRange(node, start, end, left, right, value) {
        if (this.lazy[node] !== 0) {
            this.tree[node] += (end - start + 1) * this.lazy[node];
            if (start !== end) {
                this.lazy[node * 2 + 1] += this.lazy[node];
                this.lazy[node * 2 + 2] += this.lazy[node];
            }
            this.lazy[node] = 0;
        }

        if (start > right || end < left) return;
        if (start >= left && end <= right) {
            this.tree[node] += (end - start + 1) * value;
            if (start !== end) {
                this.lazy[node * 2 + 1] += value;
                this.lazy[node * 2 + 2] += value;
            }
            return;
        }

        const mid = Math.floor((start + end) / 2);
        this.updateRange(node * 2 + 1, start, mid, left, right, value);
        this.updateRange(node * 2 + 2, mid + 1, end, left, right, value);
        this.tree[node] = this.tree[node * 2 + 1] + this.tree[node * 2 + 2];
    }

    queryRange(node, start, end, left, right) {
        if (start > right || end < left) return 0;
        if (this.lazy[node] !== 0) {
            this.tree[node] += (end - start + 1) * this.lazy[node];
            if (start !== end) {
                this.lazy[node * 2 + 1] += this.lazy[node];
                this.lazy[node * 2 + 2] += this.lazy[node];
            }
            this.lazy[node] = 0;
        }

        if (start >= left && end <= right) {
            return this.tree[node];
        }

        const mid = Math.floor((start + end) / 2);
        const p1 = this.queryRange(node * 2 + 1, start, mid, left, right);
        const p2 = this.queryRange(node * 2 + 2, mid + 1, end, left, right);
        return p1 + p2;
    }

    updatePoint(node, start, end, index, value) {
        if (start === end) {
            this.tree[node] = value;
            return;
        }

        const mid = Math.floor((start + end) / 2);
        if (index <= mid) {
            this.updatePoint(node * 2 + 1, start, mid, index, value);
        } else {
            this.updatePoint(node * 2 + 2, mid + 1, end, index, value);
        }
        this.tree[node] = this.tree[node * 2 + 1] + this.tree[node * 2 + 2];
    }

    queryPoint(node, start, end, index) {
        if (start === end) {
            return this.tree[node];
        }

        const mid = Math.floor((start + end) / 2);
        if (index <= mid) {
            return this.queryPoint(node * 2 + 1, start, mid, index);
        } else {
            return this.queryPoint(node * 2 + 2, mid + 1, end, index);
        }
    }
}   

var data = [1, 2, 3, 4, 5];
var tree = new SegmentTree5(data);

// Update a range of values in the tree
tree.updateRange(0, 0, tree.n - 1, 1, 3, 1);

// Query the sum of values in a given range
var sum = tree.queryRange(0, 0, tree.n - 1, 1, 3); // sum is 9
console.log(sum);

// Update the value of a single element in the tree
tree.updatePoint(0, 0, tree.n - 1, 2, 10);

// Query the value of a single element in the tree
var value = tree.queryPoint(0, 0, tree.n - 1, 2); // value is 10
console.log(sum);
