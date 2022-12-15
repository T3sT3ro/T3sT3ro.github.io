import $ from '../../in.js';
import * as fs from "fs";
import * from "tables";

const t = $('../../2022/IN/12');
console.log(mapAll(t, (x) => '#'));