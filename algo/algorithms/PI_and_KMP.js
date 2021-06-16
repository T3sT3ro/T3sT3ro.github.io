// returns a table saying, that for [i]=d substring [0..i] has longest prefixo-suffix of length d

function PI(pattern) {
    let [pi, k] = [[0, 0], 0]; // k marks the end position of last prefix-suffix
    for (let i = 1; i < pattern.length; ++i) {

        while (k > 0 && pattern[k] != pattern[i])
            k = pi[k - 1];
        if (pattern[k] == pattern[i])
            ++k;
        pi[i] = k;
    }
    return pi;
}

console.log(PI("banana"));
console.log(PI("bbbbbabb"));
console.log(PI("bababa"));
console.log(PI("babana"));

function KMP(T, P) { // Text, Pattern
    let pi = PI(P); // pattern#text version ain't online
    let [i, j] = [0, 0];
    while (i < T.length) {
        while (i < T.length && j < P.length && T[i] == P[j])
            [i, j] = [++i, ++j];
        
        if (j == P.length) return true;
        
        if (j > 0) j = pi[j - 1];
        else ++i;
    }
    return false;
}

// as it turns out, to find a pattern p1*p2*p3 in text it's sufficient, to first find p1, then p2 after that place etc
// no need to modify neither PI nor KMP function.

/// prefix function for pattern containing '*' matching any subword 
function PI_star(pattern) {
    let checkpoint = 0;
    let [pi, k] = [[checkpoint], checkpoint]; // k marks end of last prefix-suffix from checkpoint
    for (let i = 1; i < pattern.length; ++i) {
        if (pattern[i] == '*') { // checkpoint - start counting pi anew from this point
            pi[i] = '*'; // checkpoint - this value should never be used
            ++i;
            pi[i] = checkpoint = k = i; // p[i] won't be used anyway
            continue;
        }
        while (k > checkpoint && pattern[k] != pattern[i])
            k = pi[k - 1];
        if (pattern[k] == pattern[i])
            ++k;
        pi[i] = k;
    }
    return pi;
}

console.log(PI_star("banana"));
console.log(PI_star("bbbbbabb"));
console.log(PI_star("bababa"));
console.log(PI_star("babana"));
console.log(PI_star("bbb*babb"));

function KMP_star(T, P) { // Text, Pattern
    let pi = PI_star(P); // pattern#text version ain't online
    let [i, j] = [0, 0]; // i for T, j for P
    let checkpoint = 0;
    while (i < T.length) {
        while (i < T.length && j < P.length && (T[i] == P[j] || P[j]=='*')){
            if(P[j] != '*') ++i;
            else checkpoint = j+1;
            ++j;
        }
        
        if (j == P.length) return true;
        
        if (j > checkpoint) j = pi[j - 1];
        else ++i;
    }
    return false;
}

console.log(KMP_star('pad cac whatever bab end','cac*bab'));
