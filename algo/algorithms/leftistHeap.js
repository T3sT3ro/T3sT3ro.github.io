// leftist heap as amortized implementation of joinable priority queue

function Tree(L, key, h, R) { return {L:L, key:key, h:h, R:R}; }
function h(T) { return T?.h ?? 0; }
function key(T) { return T?.key ?? +Infinity; }

function join(T1, T2){
    if(T1 == null) return T2;
    if(T2 == null) return T1;
    // swap, so that T1.key <= T2.key, and T1 is not null
    if(key(T1) > key(T2)) [T1, T2] = [T2, T1];
    
    let [TL, TR] = [T1.L, join(T1.R, T2)];
    // keep the invariant
    if(h(TL) < h(TR)) [TL, TR] = [TR, TL];
    return Tree(TL, key(T1), h(TR)+1, TR); // right hole goes 1 down
}

function deleteMin(T){ // returns deleted element and resulting tree
    return [T.key, join(T.L, T.R)];
}

function insert(T, k){ // returns resulting tree
    let unit = Tree(null, k, 1, null);
    return join(T, unit);
}


let PQ = null;
let t = [6,1,5,2,9,7,8,3,4,0];

for(const x of t)
    PQ = insert(PQ, x);
console.log(PQ);

for(let x in t){
    [x, PQ] = deleteMin(PQ);
    console.log(x);
}
