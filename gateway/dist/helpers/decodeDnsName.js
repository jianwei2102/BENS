"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function decodeDnsName(encoded) {
    let parts = [];
    let idx = 0;
    while (idx < encoded.length) {
        const len = encoded[idx];
        if (len === 0)
            break;
        idx++;
        parts.push(encoded.slice(idx, idx + len).toString("utf8"));
        idx += len;
    }
    return parts.join(".");
}
exports.default = decodeDnsName;
