function Tree(L, key, h, R) { return {L:L, key:key, h:h, R:R}; }
function h(T) { return T?.h ?? 0; }
function key(T) { return T?.key ?? +Infinity; }

function join(T1, T2){
    if(T1 == null) return T2;
    if(T2 == null) return T1;
    // zamieniamy, żeby T1.key <= T2.key + kontrola nulli
    if(key(T1) > key(T2)) [T1, T2] = [T2, T1];
    
    let [TL, TR] = [T1?.L, join(T1?.R, T2)];
    // zachowujemy niezmiennik
    if(h(TL) < h(TR)) [TL, TR] = [TR, TL];
    return Tree(TL, key(T1), h(TR)+1, TR); // prawa dziura o 1 w dół
}

function deleteMin(T){ // zwraca usunięty element i wynikowe drzewo
    return [T.key, join(T.L, T.R)];
}

function insert(T, k){ // zwraca wynikowe drzewo
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
