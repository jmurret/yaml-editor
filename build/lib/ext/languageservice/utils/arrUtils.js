"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeDuplicates(arr, prop) {
    var new_arr = [];
    var lookup = {};
    for (var i in arr) {
        lookup[arr[i][prop]] = arr[i];
    }
    for (i in lookup) {
        new_arr.push(lookup[i]);
    }
    return new_arr;
}
exports.removeDuplicates = removeDuplicates;
function getLineOffsets(textDocString) {
    var lineOffsets = [];
    var text = textDocString;
    var isLineStart = true;
    for (var i = 0; i < text.length; i++) {
        if (isLineStart) {
            lineOffsets.push(i);
            isLineStart = false;
        }
        var ch = text.charAt(i);
        isLineStart = (ch === '\r' || ch === '\n');
        if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
            i++;
        }
    }
    if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
    }
    return lineOffsets;
}
exports.getLineOffsets = getLineOffsets;
function removeDuplicatesObj(objArray) {
    var nonDuplicateSet = new Set();
    var nonDuplicateArr = [];
    for (var obj in objArray) {
        var currObj = objArray[obj];
        var stringifiedObj = JSON.stringify(currObj);
        if (!nonDuplicateSet.has(stringifiedObj)) {
            nonDuplicateArr.push(currObj);
            nonDuplicateSet.add(stringifiedObj);
        }
    }
    return nonDuplicateArr;
}
exports.removeDuplicatesObj = removeDuplicatesObj;
function matchOffsetToDocument(offset, jsonDocuments) {
    for (var jsonDoc in jsonDocuments.documents) {
        var currJsonDoc = jsonDocuments.documents[jsonDoc];
        if (currJsonDoc.root && currJsonDoc.root.end >= offset && currJsonDoc.root.start <= offset) {
            return currJsonDoc;
        }
    }
    return null;
}
exports.matchOffsetToDocument = matchOffsetToDocument;
//# sourceMappingURL=arrUtils.js.map