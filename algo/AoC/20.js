t = $('pre').textContent.split('\n\n').filter(ts => ts.length>0).map(ts => ts.split('\n'))
ds = t.map(([td, ...tile])=> [(parseInt(td.substr(5,4))), tile])
tileStrings = Object.fromEntries(ds);

tiles = {};

function edgeID(tileID, side, CCW = false){
    let edge = "";
    let tile = tileStrings[tileID];
    if(side == 'N') edge = tile[0]
    if(side == 'E') edge = tile.map(tr => tr[tr.length-1]).join('');
    if(side == 'S') edge = tile[tile.length-1].split('').reverse().join('');
    if(side == 'W') edge = tile.slice().reverse().map(tr => tr[0]).join('');
    
    if(CCW) edge = edge.split('').reverse().join('');
    return parseInt(edge.replaceAll('#', 1).replaceAll('.', 0), 2);
}

ds.forEach(([ID, tile]) => {
    tiles[ID] = {
        CW:[edgeID(tile, 'N'), edgeID(tile, 'E'), edgeID(tile, 'S'), edgeID(tile, 'W')],
        CCW:[edgeID(tile, 'N', true), edgeID(tile, 'W', true), edgeID(tile, 'S', true), edgeID(tile, 'E', true)]
        }
})

function isRect(puzzle){
    let height = puzzle.length;
    return puzzle.every(r => r.length == puzzleCnt/height);
}



edges = {};
Object.entries(tiles).forEach(([ID, tile]) => {tile.CW.forEach( e => edges[e] = [...(edges[e] || []), ID]), tile.CCW.forEach( e => edges[e] = [...(edges[e] || []), ID])} ) 

function getFlipRot(ID, edgeID){
    return tiles[ID].CW.includes(edgeID) ? [false, tiles[ID].CW.indexOf(edgeID)] : [true, tiles[ID].CCW.indexOf(edgeID)];
}

function getRequiredFlipRot(tileID, edgeID, side){ // return rotation and flip needed to get the edge on the side
    let [flip, rot] = getFlipRot(tileID, edgeID);
    if(rot == -1) return null;
    let requiredRot = "NESW".indexOf(side);
    return [flip, (rot-requiredRot+4)%4];
}

function getEdgeAfterFlipRot(tileID, side, flip, rot){
    let edges = flip ? tiles[tileID].CCW : tiles[tileID].CW;
    let requestIdx = ('NESW'.indexIf(side)+rot)%4;
    return edges[requestIdx];
}

puzzle[[0,0]] = {tile:2383, flip:true, rot:0}

// part 1 - finding corners
Object.fromEntries(Object.entries(Object.entries(borderEdges).sort(([e1, t1], [e2, t2]) => t1-t2).reduce((obj, [e, tid]) => Object.assign(obj, {[tid]:[...(obj[tid] || []), e]}), {})).filter(([k, v]) => v.length == 4))


function getTileToSide(cords, side='S'){
    let prev = puzzle[cords];
    let connectingEdge = getEdgeAfterFlipRot(prev.tile, side, prev.flip, prev.rot);
    let neighborTileIDs = edges[connectingEdge].filter(tid => tid != prev.tile);
    if(neighborTileIDs.length == 0) return null;
    let neighID = neighborTileIDs[0];
    let [flip, rot] = getRequiredFlipRot(neighID, connectingEdge, 'NESW'['SWNE'.indexOf(side)]);
    return {tile: parseInt(neighID), flip: flip, rot: rot};
}


function solvePuzzle(){
    let IDS = Object.keys(tiles);
    let first = IDS[0];
    puzzle = {[[0,0]]: {ID:first, flipped:false, rot:0}}; // will store [x, y] -> {ID, flip, rot}
    let Q = [first, [0,0]];
    while(Q.length > 0){
        let popped = Q[0];
        console.log(`popped:${popped} tileID: ${tileID} cords:${cords}`);
        Q.splice(1);
        IDS = IDS.filter(id => id != tileID); // remove this tile from available tiles

        matcher:
        for(const id of IDS){
        for(let f=0; f<=1; ++f){ // flipped
        for(let r=0; r<4; ++r){ // rotated
            console.log(`for ${tileID} consider ${id}`);
            if ( edge(id, 'S', f, r) == edge(tileID, 'N', puzzle[cords].flipped, puzzle[cords].rot)) {
                let newcords = [cords[0]-1, cords[1]];
                puzzle[newcords] = {ID:id, flipped:false, rot:r};
                Q.push([id, newcords])
                break matcher;
            }
            if ( edge(id, 'N', f, r) == edge(tileID, 'S', puzzle[cords].flipped, puzzle[cords].rot)) {
                let newcords = [cords[0]+1, cords[1]];
                puzzle[newcords] = {ID:id, flipped:false, rot:r};
                Q.push([id, newcords])
                break matcher;
            }
            if ( edge(id, 'E', f, r) == edge(tileID, 'W', puzzle[cords].flipped, puzzle[cords].rot)) {
                let newcords = [cords[0], cords[1]+1];
                puzzle[newcords] = {ID:id, flipped:false, rot:r};
                Q.push([id, newcords])
                break matcher;
            }
            if ( edge(id, 'W', f, r) == edge(tileID, 'E', puzzle[cords].flipped, puzzle[cords].rot)) {
                let newcords = [cords[0], cords[1]-1];
                puzzle[newcords] = {ID:id, flipped:false, rot:r};
                Q.push([id, newcords])
                break matcher;
            }
        }
        }
        }
    }
}