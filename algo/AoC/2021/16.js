$ = require('../in.js');
const _ = require('lodash');

const T = $('IN/16').textContent.trim().split('')
    .map(hex => parseInt(hex, 16).toString(2).padStart(4, '0'))
    .join('');

/**
 * 
 * @param {[string]} t split bitstream
 * @param {number} cs callstack size to debug
 * @param {*} toParse 
 * @returns 
 */
function readPackets(t, toParse/* , cs=1 */) {
    // console.log(t.length);
    let packets = [];
    let packet;

    do {

        // header
        packet = {
            ver: parseInt(t.splice(0, 3).join(''), 2),
            type: parseInt(t.splice(0, 3).join(''), 2),
        };

        // literal
        if (packet.type == 4) {
            packet.number = '';
            let pentet;
            do {
                pentet = t.splice(0, 5).join('');
                packet.number += pentet.substring(1);
            } while (pentet[0] == '1');
            packet.number = parseInt(packet.number, 2);
        }

        //operator
        else {
            packet.lengthType = parseInt(t.splice(0, 1).join(''), 2);
            // fixed length
            if (packet.lengthType == 0) {
                packet.totalLength = parseInt(t.splice(0, 15).join(''), 2);
                packet.packets = readPackets(t.splice(0, packet.totalLength), Infinity/* , cs + 1 */);
            }
            // packet count
            else {
                packet.packetCount = parseInt(t.splice(0, 11).join(''), 2);
                packet.packets = readPackets(t, packet.packetCount/* , cs + 1 */);
            }
        }
        packets.push(packet);
    } while (t.length > 0 && --toParse > 0);
    return packets;
}

let packets = readPackets(T.split(''));

function visit(packets, visitor) {
    if (!packets) return [];
    return packets
        .map(p => visitor(p))
        .concat(packets.flatMap(p => visit(p.packets, visitor)));
}

function e(packet) {
    let px = packet.packets;
    switch (packet.type) {
        case 0: // +
            return _.sum(px.map(e));
        case 1: // *
            return px.map(e).reduce((a, x) => a * x, 1);
        case 2: // min
            return _.min(px.map(e));
        case 3: // max
            return _.max(px.map(e));
        case 4: // val
            return packet.number;
        case 5: // >
            return e(px[0]) > e(px[1]) ? 1 : 0;
        case 6: // <
            return e(px[0]) < e(px[1]) ? 1 : 0;
        case 7: // =
            return e(px[0]) == e(px[1]) ? 1 : 0;
    }
}

console.log(_.sum(visit(packets, p => p.ver)), e(packets[0]));

//------------------

function pack(packet) {
    let bitstream = "";
    bitstream += '<' + packet.ver.toString(2).padStart(3, '0') + '>';
    bitstream += '<' + packet.type.toString(2).padStart(3, '0') + '>';
    if (packet.type == 4) { // number
        let halfbytes = packet.number.toString(16).split('');
        bitstream += halfbytes.map((x, i) =>
            '[' + (i == halfbytes.length - 1 ? '0' : '1')
            + parseInt(x, 16).toString(2).padStart(4, '0') + ']').join('');
    }

    else { //recurse
        if (packet.lengthType == 0) {
            let content = packet.packets.map(p => pack(p)).join('');
            let totalLength = content.replaceAll(/[^01]/g, '').length;
            bitstream += '(0){' + totalLength.toString(2).padStart(15, '0') + '|' + content + `}`;
        }
        if (packet.lengthType == 1) {
            let content = packet.packets.map(p => pack(p)).join('');
            bitstream += '(1)[' + packet.packets.length.toString(2).padStart(11, '0') + '|' + content + ']';
        }
    }
    return bitstream;
}

function test(packet) {
    let packed = pack(packet);
    console.error(packed);
    console.error(readPackets(packed.replaceAll(/[^01]/g, '').split('')));
}

console.error('--TESTS--');
test({ ver: 6, type: 4, number: 17 });
test({ ver: 0, type: 1, lengthType: 1, packets: [{ ver: 6, type: 4, number: 15 }, { ver: 6, type: 4, number: 7 }] });

function rpn(packet) {
    let px = packet.packets;
    switch (packet.type) {
        case 0: // +
            return `(+ ${px.map(p => rpn(p)).join(' ')})`;
        case 1: // *
            return `(* ${px.map(p => rpn(p)).join(' ')})`;
        case 2: // min
            return `(min ${px.map(p => rpn(p)).join(' ')})`;
        case 3: // max
            return `(max ${px.map(p => rpn(p)).join(' ')})`;
        case 4: // val
            return packet.number;
        case 5: // >
            return `(if (> ${px.map(p => rpn(p)).join(' ')}) 1 0)`;
        case 6: // <
            return `(if (< ${px.map(p => rpn(p)).join(' ')}) 1 0)`;
        case 7: // =
            return `(if (= ${px.map(p => rpn(p)).join(' ')}) 1 0)`;
    }
}

console.error(rpn(packets[0]));