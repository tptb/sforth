/**
The MIT License (MIT)

Copyright (c) 2013 Bernd Amend <bernd.amend+sforth@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// example app for nodejs

Filesystem = require('fs');

// has to be done in the main file :(
PDFDocument = require("pdfkit");

// PNG = require('pngjs').PNG;

//require("./sforth.js");
//require("./sforth-runtime.js");

global.eval(Filesystem.readFileSync('sforth.js').toString());
global.eval(Filesystem.readFileSync('sforth-runtime.js').toString());

compiler_message_handler=console.log

//var tokens = forth.tokenize(Filesystem.readFileSync("nodejs.fs").toString());
//var code_tree = forth.createFromForthTokens(tokens);
//console.log(JSON.stringify(code_tree, null, "\t"));
//console.log(forth.generateJsCode(code_tree));

var compiled_code = forth.compile(Filesystem.readFileSync("nodejs.fs").toString());
// Filesystem.writeFileSync("compiled-nodejs.fs", compiled_code);
// console.log(compiled_code);
global.eval(compiled_code);
