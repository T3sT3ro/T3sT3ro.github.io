let [Srules, strings] = $('pre').textContent.split('\n\n').map(ts => ts.split('\n').filter(x => x.length > 0))
let [Srules, strings] = $('pre').textContent.split('\n\n').map(ts => ts.split('\n').filter(x => x.length > 0))
Srules = Srules.map(x => x.split(': '))
Srules = Srules.map(([prod, results]) => [prod, results.split(' | ').map(rs => rs.split(' '))])
rules = Srules.reduce((obj, [prod, results]) => Object.assign(obj, {[prod]:results}), {})
Srules = Srules.sort(([n1, rest], [n2, rest2]) => n1-n2)
rules = Srules.map(r => r[1])

function cykMatch(productions, word){
    
    // let CYK = {};
    // initialize one-letter productions
    let terminals = productions.map((c, i) => typeof(c) == 'string' ? c : '.').join('') // endoces rule number to . if non terminal production
    word.split('').forEach((c,i) => CYK[[word.substr(i, 1), terminals.indexOf(c)]] = (_ => true)); 
    let lazyFalse = (_=>false);

    for(let d=2; d <= word.length; ++d){ // d = substring length
    for(let p=0; p+d<=word.length; ++p){ // p = substring start
    for(let rule=0; rule < productions.length; ++rule){ // rules are indices
    if(terminals[rule] == '.') // skip terminal rules
    productions[rule].forEach( prod => { // prod is a single AND rule e.g. 1 -> 2 3 | 4 5 is 2 prods: 1 -> 2 3 and 1 -> 4 5
        
        if(prod.length == 1) {
            let f = CYK[[word.substr(p,d),rule]] || lazyFalse; // save previous evauator function to closure or default it to false returner `f`
            CYK[[word.substr(p,d),rule]] = (_ => f() || (CYK[[word.substr(p,d),prod[0]]] || lazyFalse)()); // handling single rule like 8 -> 42. Use previous evaluator ORed
        } else {
            for(let sublen=1; sublen<d; ++sublen){ // for all partitions, where first has `sublen` size (sub-string-length)
                let f = CYK[[word.substr(p,d),rule]] || lazyFalse; // OR with other possible splits or default lazy false if this is the first split
                // lazy false
                CYK[[word.substr(p,d),rule]] = (_ => f() || (CYK[[sublen,p,prod[0]]] || lazyFalse)() && (CYK[[d-sublen,p+sublen,prod[1]]] || lazyFalse)());
            }
        }
    });
    }        
    }
    }
    return (CYK[[word.length, 0, 0]] || lazyFalse)();
}


console.log(ok, cyk);

// ^
// this probably doesn't work..... IDK, counts for eternity :|


// but this regex generator works...
// ...
// dirty....
function buildCappedRegex(rules, node, cap){
    if(cap == 0) return "";
    if(typeof(rules[node]) == 'string') return rules[node];
    return `(?:${rules[node].map(r => r.map(p => buildCappedRegex(rules, p, node == p ? cap-1 : cap)).join('')).join('|')})`;
}

rx = RegExp(`^${buildCappedRegex(rules, 0, 1)}$`); // part 1
rx = RegExp(`^${buildCappedRegex(rules, 0, 10)}$`); // part 2

strings.filter(s => s.match(rx))