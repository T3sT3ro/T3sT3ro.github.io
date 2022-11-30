// max continuous sum of the subarray
// Kadane's algorithm
// explained at https://www.youtube.com/watch?v=86CQq3pKSUw

// It works as follows:
//  For each index at array, we want to know the maximum continuous subarray
// ending at that index. That means, that it can be extended from the previous
// element, or it can start anew.


// returns 0 if t is all negative (admits empty subarray)
function kadane(t) { 
    let [bestSum, currentSum] = [t[0], t[0]];
    for(let x of t) {
        currentSum = Math.max(currentSum + x, x);
        bestSum = Math.max(currentSum, bestSum);
    }
    return bestSum;
}

console.log(kadane([1,2,-4,5,2,-7,3,8,-4,5,-2]));