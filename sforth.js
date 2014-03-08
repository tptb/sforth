/**
The MIT License (MIT)

Copyright (c) 2013-2014 Bernd Amend <bernd.amend+sforth@gmail.com>

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

var forth = forth || {};

forth.compiler_message_handler = function(str) {};

// We don't allow . in function names
// if you use $ ensure that you don't write one of the following strings
forth.mangling = {
	"€": "$$euro",
	"=": "$$eq",
	">": "$$greater",
	"<": "$$less",
	"+": "$$plus",
	"-": "$$minus",
	"*": "$$times",
	"/": "$$div",
	"!": "$$bang",
	"@": "$$at",
	"#": "$$hash",
	"%": "$$percent",
	"^": "$$up",
	"&": "$$amp",
	"~": "$$tilde",
	"?": "$$qmark",
	"|": "$$bar",
	"\\": "$$bslash",
	":": "$$colon",
	";": "$$semicolon",
	",": "$$comma",
	"[": "$$obracket",
	"]": "$$cbracket",
	"(": "$$oparentheses",
	")": "$$cparentheses",
	"{": "$$obraces",
	"}": "$$obraces",
	"·": "$$middot",
	"\"": "$$quotationmark"
};

forth.mangleName = function(str) {
	var result = str;

	if(Number.isNumeric(str.charAt(0))) {
		result = "$$" + result;
	}

	for(var s in forth.mangling) {
		result = result.replaceAll(s, forth.mangling[s]);
	}

	if(result[0] == ".")
		result = "$$dot" + result.substr(1);
	if(result[result.length-1] == ".")
		result = "$$dot" + result.substr(0, result.length-1);

	return result;
}

forth.demangleName = function (str) {
	var result = str;
	for(var s in forth.mangling) {
		result = result.replaceAll(forth.mangling[s], s);
	}
	return result;
}

forth.Types = {
	BeginAgain: "BeginAgain",
	BeginUntil: "BeginUntil",
	BeginWhileRepeat: "BeginWhileRepeat",
	BranchCase: "BranchCase",
	BranchCaseOf: "BranchCaseOf",
	BranchIf: "BranchIf",
	BranchIfBody: "BranchIfBody",
	Body: "Body",
	Call: "Call",
	CommentLine: "CommentLine",
	CommentParentheses: "CommentParentheses",
	DoLoop: "DoLoop",
	FunctionForth: "FunctionForth",
	FunctionForthAnonymous: "FunctionForthAnonymous",
	FunctionJs: "FunctionJs",
	FunctionJsAnonymous: "FunctionJsAnonymous",
	JsCode: "JsCode",
	JsCodeDirect: "JsCodeDirect",
	JsCodeWithReturn: "JsCodeWithReturn",
	Macro: "Macro",
	Number: "Number",
	String: "String",
	TryCatchFinally: "TryCatchFinally",
	ValueLocal: "ValueLocal"
};

forth.BeginAgain = function(body) {
	this.type = forth.Types.BeginAgain;
	this.body = body;
};

forth.BeginUntil = function(body) {
	this.type = forth.Types.BeginUntil;
	this.body = body;
};

forth.BeginWhileRepeat = function(condition, body) {
	this.type = forth.Types.BeginWhileRepeat;
	this.condition = condition;
	this.body = body;
};

forth.BranchCase = function(body, defaultOf) {
	this.type = forth.Types.BranchCase;
	this.body = body;
	this.defaultOf = defaultOf;
};

forth.BranchCaseOf = function(condition, body) {
	this.type = forth.Types.BranchCaseOf;
	this.condition = condition;
	this.body = body;
};

forth.BranchIfBody = function(condition, body) {
	this.type = forth.Types.BranchIfBody;
	this.condition = condition;
	this.body = body;
};

forth.BranchIf = function(if_body, else_if_bodies, else_body) {
	this.type = forth.Types.BranchIf;
	this.if_body = if_body;
	this.else_if_bodies = else_if_bodies;
	this.else_body = else_body;
};

forth.Body = function() {
	this.type = forth.Types.Body;
	this.body = new Array;
};

forth.Call = function(name) {
	this.type = forth.Types.Call;
	this.name = name;
};

forth.CommentLine = function(comment) {
	this.type = forth.Types.CommentLine;
	this.comment = comment;
};

forth.CommentParentheses = function(comment) {
	this.type = forth.Types.CommentParentheses;
	this.comment = comment;
};

forth.DoLoop = function(index, body) {
	this.type = forth.Types.DoLoop;
	this.index = index;
	this.body = body;
};

forth.FunctionForth = function(name, body) {
	this.type = forth.Types.FunctionForth;
	this.name = name;
	this.body = body;
};

forth.FunctionForthAnonymous = function(body) {
	this.type = forth.Types.FunctionForthAnonymous;
	this.body = body;
};

forth.FunctionJs = function(name, args, body, returnValue) {
	this.type = forth.Types.FunctionJs;
	this.name = name;
	this.args = args;
	this.body = body;
	this.returnValue = returnValue;
};

forth.FunctionJsAnonymous = function(args, body, returnValue) {
	this.type = forth.Types.FunctionJsAnonymous;
	this.args = args;
	this.body = body;
	this.returnValue = returnValue;
};

forth.JsCode = function(body) {
	this.type = forth.Types.JsCode;
	this.body = body;
};

forth.JsCodeDirect = function(body) {
	this.type = forth.Types.JsCodeDirect;
	this.body = body;
};

forth.JsCodeWithReturn = function(body) {
	this.type = forth.Types.JsCodeWithReturn;
	this.body = body;
};

forth.Macro = function(name, args, body) {
	this.type = forth.Types.Macro;
	this.name = name;
	this.args = args;
	this.body = body;
 };

forth.Number = function(value) {
	this.type = forth.Types.Number;
	this.value = value;
};

forth.String = function(value) {
	this.type = forth.Types.String;
	this.value = value;
};

forth.TryCatchFinally = function(body, catchVar, catchBody, finallyBody) {
	this.type = forth.Types.TryCatchFinally;
	this.body = body;
	this.catchVar = catchVar;
	this.catchBody = catchBody;
	this.finallyBody = finallyBody;
}

forth.ValueLocal = function(values, comment) {
	this.type = forth.Types.ValueLocal;
	this.values = values;
	this.comment = comment;
};

// Currently this function only splits the code into tokens
// later version will also keep track where the tokens are fetched from
forth.tokenize = function(code) {
	// unify line endings
	var clean_code = code.replace(/\r\n/gm, '\n')
		.replace(/\n/gm, ' \n ')
		.replace(/\t/gm, ' \t ')
		.replace(/\r/gm, ' \n ');

	// tokenize code
	var tokens=clean_code.split(" ");

	// merge tokens
	var merged_tokens = new Array();

	function add(something) {
		merged_tokens.push(something);
	}

	for( var i = 0 ; i < tokens.length; i++ ) {
		var t = tokens[i];

		switch (t.toLowerCase()) {
			case "": // ignore empty/whitespace tokens
			case "\n":
			case "\t":
			case "\r":
				break;

			case "\\\\":
				var str = ""
				i++;
				while(i < tokens.length) {
					str += tokens[i] + " ";
					i++;
				}
				add(new forth.CommentParentheses(str.slice(0, str.length-1)));
				break;

			case "\\": // line comments
			case "//":
				var str = "";
				while(tokens[i] != "\n") {
					i++;

					if(i >= tokens.length)
						break;

					if(tokens[i] != "\n")
						str += tokens[i] + " ";
				}
				add(new forth.CommentLine(str.slice(0,str.length-1)));
				break;
			case "(": // comment start
				var str = ""
				var depth = 1;
				while(depth > 0) {
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ')'");

					if(tokens[i] == "(")
						depth++;
					else if(tokens[i] == ")") {
						depth--;
					}

					if(depth > 0)
						str += tokens[i] + " ";
				}
				add(new forth.CommentParentheses(str.slice(0, str.length-1)));
				break;
			case "/*": // comment start
				var str = ""
				var depth = 1;
				while(depth > 0) {
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing '*/'");

					if(tokens[i] == "/*")
						depth++;
					else if(tokens[i] == "*/") {
						depth--;
					}

					if(depth > 0)
						str += tokens[i] + " ";
				}
				add(new forth.CommentParentheses(str.slice(0, str.length-1)));
				break;
			case ":[": // execute js code start
				var str = ""
				i++;
				while(tokens[i] != "]:" && tokens[i] != "]:d" && tokens[i] != "];") {
					str += tokens[i] + " ";
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ']:' or ']:d' or '];' for ':[");
				}
				var localjscode = str.slice(0,str.length-1).replace(/ \t /gm, '\t');
				if(tokens[i] == "]:")
					add(new forth.JsCodeWithReturn(localjscode));
				else if(tokens[i] == "]:d")
					add(new forth.JsCodeDirect(localjscode));
				else //if(tokens[i] == "];")
					add(new forth.JsCode(localjscode));
				break;
			case "{": // local variable start
				var done = false;
				var localvars = new Array;
				var comment = "";
				i++;
				while(tokens[i] != "}") {
					if(tokens[i] == "--") {
						done = true;
						i++;
						continue;
					}
					if(!done) {
						localvars.push(tokens[i]);
					} else {
						comment += tokens[i] + " ";
					}
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing '}' for '{'");
				}
				add(new forth.ValueLocal(localvars.reverse(), comment.slice(0, comment.length-1)));
				break;
			case "{}":
				add(new forth.ValueLocal(new Array, ""));
				break;
			default:
				var replacedcommawithperiod = t.replaceAll(",", ".");
				if(Number.isNumeric(replacedcommawithperiod)) {
					add(new forth.Number(replacedcommawithperiod));
				} else if(t[0] == "'" && t.length == 2) {
					add(new forth.Number(t.charCodeAt(1)));
				} else if(t[0] == "\"" && t.length >= 2) {
					add(new forth.String(t.substr(1)));
				} else if(t[0] == "»") {
					var str = "";
					if(tokens[i].substr(tokens[i].length-1) == "«"
						&& tokens[i].substr(tokens[i].length-2) != "\\«"
					) {
						str = tokens[i].substr(1,tokens[i].length-1);
					} else {
						str = tokens[i].substr(1) + " ";
						i++;
						while(true) {
							if(tokens[i].substr(tokens[i].length-1) == "«"
								&& tokens[i].substr(tokens[i].length-2) != "\\«"
							) {
								if(tokens[i].length == 1)
									str += " ";
								else
									str += tokens[i];
								break;
							} else if(tokens[i] == "\n") {
								str += "\n";
							} else {
								str += tokens[i] + " ";
							}
							i++;

							if(i >= tokens.length)
								throw new Error("Couldn't find closing '«' for '»'");
						}
					}

					add(new forth.String(str.slice(0,str.length-1)
											.replace(/ \t /gm, '\t')
											.replace(/ \r /gm, '\r')
											.replaceAll("\"", "\\\"")
											.replaceAll("\\»", "»")
											.replaceAll("\\«", "«")
								  ));
				} else if(t[0] == "$" && t.length >= 2) {
					add(new forth.Number("0x" + t.substr(1)));
				} else if(t[0] == "%" && t.length >= 2) {
					add(new forth.Number(parseInt(t.substr(1),2)));
				} else {
					add(t);
				}
		}
	}

	return merged_tokens;
}

forth.createFromForthTokens = function(tokens, context) {
	context = context || {}; //forthClone(parent_context);

	var out = new forth.Body();

	function add(something) {
		out.body.push(something);
	}

	for( var i = 0 ; i < tokens.length; i++ ) {
		var t = tokens[i];

		var token_handled = false;

		switch(t.type) {
			case forth.Types.CommentLine:
			case forth.Types.CommentParentheses:
			case forth.Types.JsCodeWithReturn:
			case forth.Types.JsCodeDirect:
			case forth.Types.JsCode:
			case forth.Types.ValueLocal:
			case forth.Types.Number:
			case forth.Types.String:
				add(t);
				token_handled = true;
				break;
		}

		if(token_handled)
			continue;

		switch (t.toLowerCase()) {
			case "if":
				var depth = 1;

				var tokensIf = new Array;
				var tokensElseIf = null;
				var tokensElse = null;
				var current = tokensIf;

				while(depth > 0) {
					i++;

					if(i >= tokens.length) {
						console.log("tokens=" + JSON.stringify(tokens));
						throw new Error("Couldn't find closing 'endif/then' for 'if'");
					}

					if(tokens[i].type) {
						current.push(tokens[i]);
						continue;
					}

					switch(tokens[i].toLowerCase()) {
						case "if":
							depth++;
							current.push(tokens[i]);
							break;
						case "elseif":
							if(depth == 1) {
								if(!tokensElseIf)
									tokensElseIf = new Array;

								var elseIf = new forth.BranchIfBody(new Array, new Array);
								tokensElseIf.push(elseIf);

								current = elseIf.condition;
								// scan for the next if
								while(true) {
									i++;
									if(i >= tokens.length) {
										console.log("tokens=" + JSON.stringify(tokens));
										throw new Error("Couldn't find closing 'if' for 'elseif'");
									}
									if(!tokens[i].type && tokens[i].toLowerCase() == "if")
										break;

									current.push(tokens[i]);
								}

								current = elseIf.body;
								//console.log("current=" + JSON.stringify(elseIf));
							} else {
								current.push(tokens[i]);
							}
							break;
						case "else":
							if(depth == 1) {
								tokensElse = new Array;
								current = tokensElse;
							} else {
								current.push(tokens[i]);
							}
							break;
						case "then":
						case "endif":
							depth--;
							if(depth > 0)
								current.push(tokens[i]);
							break;
						default:
							current.push(tokens[i]);
					}
				}

				var compiledIf = null;
				var compiledElseIf = null;
				var compiledElse = null;

				if(tokensIf)
					compiledIf = forth.createFromForthTokens(tokensIf, context);

				if(tokensElseIf) {
					compiledElseIf = new Array;
					tokensElseIf.forEach(function(entry) {
						var condition = forth.createFromForthTokens(entry.condition, context);
						var body = forth.createFromForthTokens(entry.body, context);
						compiledElseIf.push(new forth.BranchIfBody(condition, body));
					});
				}

				if(tokensElse)
					compiledElse = forth.createFromForthTokens(tokensElse, context);

				add(new forth.BranchIf(compiledIf, compiledElseIf, compiledElse));
				break;
			case "try":
				var depth = 1;

				var tokensBody = new Array;
				var tokensCatch = null;
				var tokensFinally = null;

				var catchVar = null;

				var current = tokensBody;
				while(depth > 0) {
					i++;

					if(i >= tokens.length) {
						console.log("tokens=" + JSON.stringify(tokens));
						throw new Error("Couldn't find 'endtry' for 'try'");
					}

					if(tokens[i].type) {
						current.push(tokens[i]);
						continue;
					}

					switch(tokens[i].toLowerCase()) {
						case "try":
							depth++;
							current.push(tokens[i]);
							break;
						case "catch":
							if(depth == 1) {
								i++;
								catchVar = tokens[i];
								tokensCatch = new Array;
								current = tokensCatch;
							} else {
								current.push(tokens[i]);
							}
							break;
						case "finally":
							if(depth == 1) {
								tokensFinally = new Array;
								current = tokensFinally;
							} else {
								current.push(tokens[i]);
							}
						case "endtry":
							depth--;
							if(depth > 0)
								current.push(tokens[i]);
							break;
						default:
							current.push(tokens[i]);
					}
				}

				var compiledBody = null;
				var compiledCatch = null;
				var compiledFinally = null;

				if(tokensBody)
					compiledBody = forth.createFromForthTokens(tokensBody, context);

				if(tokensCatch)
					compiledCatch = forth.createFromForthTokens(tokensCatch, context);

				if(tokensFinally)
					compiledFinally = forth.createFromForthTokens(tokensFinally, context);

				add(new forth.TryCatchFinally(compiledBody, catchVar, compiledCatch, compiledFinally));
				break;
			case "begin":
				var depth = 1;

				var current = new Array;
				while(depth > 0) {
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing 'again/until' for 'begin'");

					if(tokens[i].type) {
						current.push(tokens[i]);
						continue;
					}

					switch(tokens[i].toLowerCase()) {
						case "begin":
							depth++;
							current.push(tokens[i]);
							break;
						case "until":
						case "again":
							depth--;
							if(depth > 0)
								current.push(tokens[i]);
							break;
						default:
							current.push(tokens[i]);
					}
				}

				var ltoken = tokens[i].toLowerCase();
				if(ltoken.toLowerCase() == "until")
					add(new forth.BeginUntil(forth.createFromForthTokens(current, context)));
				else if(ltoken == "again")
					add(new forth.BeginAgain(forth.createFromForthTokens(current, context)));
				else
					throw new Error("Internal compiler error: last closing element in a begin loop was invalid");
				break;
			case "case":
				// TODO: we have to parse the of entries
				var depth = 1;

				var current = new Array;
				var defaultOf = null;
				while(depth > 0) {
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing 'endcase' for 'case'");

					if(tokens[i].type) {
						current.push(tokens[i]);
						continue;
					}

					switch(tokens[i].toLowerCase()) {
						case "case":
							depth++;
							current.push(tokens[i]);
							break;
						case "endcase":
							depth--;
							if(depth > 0)
								current.push(tokens[i]);
							break;
						default:
							current.push(tokens[i]);
					}
				}

				// parse of endof

				add(new forth.BranchCase(forth.createFromForthTokens(current, context), defaultOf));
				break;
			case "do":
			case "?do":
				var depth = 1;

				var start = tokens[i];

				i++;

				if(i >= tokens.length)
						throw new Error("Couldn't find closing element for '" + start + "'");

				var idx = tokens[i]

				var current = new Array;
				while(depth > 0) {
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing element for '" + start + "'");

					if(tokens[i].type) {
						current.push(tokens[i]);
						continue;
					}

					switch(tokens[i].toLowerCase()) {
						case "do":
						case "?do":
							depth++;
							current.push(tokens[i]);
							break;
						case "loop":
							depth--;
							if(depth > 0)
								current.push(tokens[i]);
							break;
						default:
							current.push(tokens[i]);
					}
				}

				var end = tokens[i].toLowerCase();
				switch(end) {
					case "loop":
						add(new forth.DoLoop(idx, forth.createFromForthTokens(current, context)));
						break;
					default:
						throw new Error("Internal compiler error: last closing element in a '" + start + "' loop was invalid");
				}
				break;
			case "include":
				var str = ""
				i++;

				if(i >= tokens.length)
					throw new Error("Couldn't find closing '\"' for 'include'");
				if(tokens[i].type == forth.Types.String) {
					add(forth.createFromForth(Filesystem.readFileSync(tokens[i].value).toString(), context));
				} else {
					add(forth.createFromForth(Filesystem.readFileSync(tokens[i]).toString(), context));
				}
				break;

			case ":": // function definition
				var depth = 1;
				i++;

				if(i >= tokens.length)
					throw new Error("Couldn't find closing ';' for ':'");

				var function_name = tokens[i];

				var localtokens = new Array;

				while(depth > 0) {
					i++;
					if(tokens[i] == ":" || tokens[i] == ":noname" || tokens[i] == ":js" || tokens[i] == ":jsnoname") {
						depth++;
					} else if(tokens[i] == ";" || tokens[i] == "return;") {
						depth--;
					}
					if(depth > 0)
						localtokens.push(tokens[i]);

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ';' for ':'");
				}

				add(new forth.FunctionForth(function_name, forth.createFromForthTokens(localtokens, context)));
				break;
			case ":noname": // function definition
				var depth = 1;

				var localtokens = new Array;

				while(depth > 0) {
					i++;
					if(tokens[i] == ":" || tokens[i] == ":noname" || tokens[i] == ":js" || tokens[i] == ":jsnoname") {
						depth++;
					} else if(tokens[i] == ";" || tokens[i] == "return;") {
						depth--;
					}
					if(depth > 0)
						localtokens.push(tokens[i]);

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ';' for ':noname'");
				}

				add(new forth.FunctionForthAnonymous(forth.createFromForthTokens(localtokens, context)));
				break;
			case ":js": // function definition
				i++;
				if(i >= tokens.length)
					throw new Error("Couldn't find closing ';/return;' for ':js'");

				var function_name = tokens[i];

				var depth = 1;

				var localtokens = new Array;

				var returnValue = false;

				while(depth > 0) {
					i++;
					if(tokens[i] == ":" || tokens[i] == ":noname" || tokens[i] == ":js" || tokens[i] == ":jsnoname") {
						depth++;
					} else if(tokens[i] == ";" || tokens[i] == "return;") {
						depth--;
					}
					if(depth > 0)
						localtokens.push(tokens[i]);

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ';/return;' for ':js'");
				}

				if(tokens[i] == ";")
					returnValue = false;
				else if(tokens[i] == "return;")
					returnValue = true;
				else
					throw new Error("something went wrong ':js'");

				var localtree = forth.createFromForthTokens(localtokens, context);
				var args = null;

				if(localtree.body.length > 0) {
					var values = localtree.body[0];
					if(values.type != forth.Types.ValueLocal)
						throw new Error(":js requires { <args> -- <comment> } after the function name");

					values.type = forth.Types.CommentParentheses;
					args = values.values.reverse();
				}

				var func = new forth.FunctionJs(function_name, args, localtree, returnValue);
				add(func);
				break;
			case ":jsnoname": // function definition
				var depth = 1;

				var localtokens = new Array;

				var returnValue = false;

				while(depth > 0) {
					i++;
					if(tokens[i] == ":" || tokens[i] == ":noname" || tokens[i] == ":js" || tokens[i] == ":jsnoname") {
						depth++;
					} else if(tokens[i] == ";" || tokens[i] == "return;") {
						depth--;
					}
					if(depth > 0)
						localtokens.push(tokens[i]);

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ';/return;' for ':jsnoname'");
				}

				if(tokens[i] == ";")
					returnValue = false;
				else if(tokens[i] == "return;")
					returnValue = true;
				else
					throw new Error("something went wrong ':jsnoname'");

				var localtree = forth.createFromForthTokens(localtokens, context);
				var args = null;

				if(localtree.body.length > 0) {
					var values = localtree.body[0];
					if(values.type != forth.Types.ValueLocal)
						throw new Error(":jsnoname requires { <args> -- <comment> } after :jsnoname");

					values.type = forth.Types.CommentParentheses;
					args = values.values.reverse();
				}

				var func = new forth.FunctionJsAnonymous(args, localtree, returnValue);
				add(func);
				break;

			// The following functions have to check if they are called in the correct scope
			// Question: Should this be done after the code_tree is build?

			// macro definition
			// macros can not be embedded into other macros
			case ":macro": // macro definition
			//case ":fmacro": // macro definition
				var depth = 1;
				i++;

				if(i >= tokens.length)
					throw new Error("Couldn't find closing ';' for ':'");

				var function_name = tokens[i];

				var localtokens = new Array;

				while(depth > 0) {
					i++;
					if(tokens[i] == ":" || tokens[i] == ":noname" || tokens[i] == ":js" || tokens[i] == ":jsnoname") {
						depth++;
					} else if(tokens[i] == ";" || tokens[i] == "return;") {
						depth--;
					}
					if(depth > 0)
						localtokens.push(tokens[i]);

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ';' for ':'");
				}

				var args = localtokens.splice(0,1)[0];

				if(args.type != forth.Types.ValueLocal)
					throw new Error(t + " " + function_name + " requires { .. } after the macro name");

				/*if(lower_t == ":fmacro") {
					if(!args.values)
						throw new Error(":fmacro requires a { } (no args) after the macro name");

					var localtree = forth.createFromForthTokens(localtokens, context);

					var func = new forth.FunctionForth(function_name, localtree);
					add(func);
				}*/

				var macro = new forth.Macro(function_name, args.values, localtokens);
				add(macro);

				if(!context.macro)
					context.macro = {};

				context.macro[forth.mangleName(function_name)] = macro;
				break;

			// forbidden tokens
			case ")": // comment end
			case "]:": // execute js code end
			case "]:d": // execute js code end
			case "else":
			case "then":
			case "endif":
			case "endcase":
			case ";":
			case "return;":
			case "}": // local variable end
				compiler_message_handler("Unexpected token " + t + " found");
				break;
			default:
				var mangledT = forth.mangleName(t);
				// TODO: resolve macro
				var macro = null;
				// first try to find the macro within the current list
				if(context.macro && context.macro[mangledT]) {
					macro = context.macro[mangledT];
				} else if(forth_macros && forth_macros[mangledT]) {
					// search within the global list
					macro = forth_macros[mangledT];
				}

				if(macro) {
					if(macro.args.length == 0) {
						//console.log(t + " insert code");
						var gcode = forth.createFromForthTokens(macro.body, context);
						//console.log(t + " = " + JSON.stringify(gcode));
						add(gcode);
					} else {
						var gcode = forthClone(macro.body);
						for(var k=0;k<macro.args.length;++k) {
							i++;
							//console.log("replace " + macro.args[k] + " with " + tokens[i]);
							//console.log("before = " + JSON.stringify(macro.body));
							for(var n=0; n<gcode.length;++n) {
								var entry = gcode[n];
								if(typeof entry.type != "undefined") {
									switch(entry.type) {
										case forth.Types.JsCodeDirect:
										case forth.Types.JsCode:
										case forth.Types.JsCodeWithReturn:
											//console.log("token: " + JSON.stringify(tokens[i]));
											if(typeof tokens[i] == "undefined") {
												console.log("Can not find required macro argument for " + macro.name);
											}
											if(typeof tokens[i].type != "undefined") {
												switch(tokens[i].type) {
													case forth.Types.Number:
														entry.body = entry.body.replaceWholeWord(macro.args[k], tokens[i].value);
														break;
													case forth.Types.String:
														entry.body = entry.body.replaceWholeWord(macro.args[k], "\"" + tokens[i].value + "\"");
														break;
													default:
														throw new Error("I don't know what I should do with " + JSON.stringify(tokens[i]) + " as a macro argument");
												}
											} else {
												// TODO: mangeling should only be done in the generateJsCode function
												entry.body = entry.body.replaceWholeWord(macro.args[k], forth.mangleName(tokens[i]));
											}
											break;
									}
								} else {
									if(entry == macro.args[k]) {
										gcode[n] = tokens[i];
									}
								}
							}
							//console.log("after = " + JSON.stringify(gcode));
						}

						//console.log("gcode = " + JSON.stringify(gcode));
						var cgcode = forth.createFromForthTokens(gcode, context);
						//console.log("cgcode = " + JSON.stringify(gcode));
						cgcode.extendedMacro=t;
						add(cgcode);
					}
					//console.log(t + " is a macro : " + JSON.stringify(context.macro[t]));
				} else {
					if(t == "typeof")
						console.log(":( try to call typeof: " + JSON.stringify(context));
					add(new forth.Call(t));
				}
		}
	}

	return out;
};

forth.createFromForth = function(code, context) {
	return forth.createFromForthTokens(forth.tokenize(code), context);
};

forth.generateForthCode = function(code_tree) {
	// TODO
};

forth.generateJsCode = function(code_tree, indent_characters) {
	if(indent_characters == undefined)
		indent_characters = "\t";

	function generateCode(code_tree, level) {

		var out = "";

		var lp =  "";
		for(var i = 0; i < level; i++)
			lp += indent_characters;

		function append(str) {
			if(str && str != "")
				out += lp + str + "\n";
		}

		switch(code_tree.type) {
			case forth.Types.BeginAgain:
				append("do {");
				out += generateCode(code_tree.body, level);
				append("} while(true);");
				break;
			case forth.Types.BeginUntil:
				append("do {");
				out += generateCode(code_tree.body, level);
				append("} while(!stack.pop());");
				break;
			case forth.Types.BeginWhileRepeat:
				append("do {");
				out += generateCode(code_tree.condition, level);
				append("if(!stack.pop()) break;");
				out += generateCode(code_tree.body, level);
				append("} while(true);");
				break;
			case forth.Types.BranchCase:
				append("switch(stack.pop()) {");
				//code_tree.body.forEach(function(entry) {
				//	out += generateCode(entry, level+1);
				//});
				out += generateCode(code_tree.body, level+1);
				if(code_tree.defaultOf) {
					append("default:");
					out += generateCode(code_tree.defaultOf, level);
				}
				append("}");
				break;
			case forth.Types.BranchCaseOf:
				append("case " + code_tree.condition + ":");
				out += generateCode(entry, level+1);
				append("break;");
				break;
			case forth.Types.BranchIf:
				var openingBrackets = 0;
				var identLevel = "";
				append("if(stack.pop()) {");
				out += generateCode(code_tree.if_body, level);
				if(code_tree.else_if_bodies) {
					code_tree.else_if_bodies.forEach(function(entry) {
						append(identLevel + "} else {");
						identLevel += indent_characters;
						out += generateCode(entry.condition, level+openingBrackets);
						append(identLevel + "if(stack.pop()) {");
						out += generateCode(entry.body, level+openingBrackets+1);
						openingBrackets++;
					});
				}
				if(code_tree.else_body) {
					append(identLevel + "} else {")
					out += generateCode(code_tree.else_body, level+openingBrackets);
				}
				for(var i=0;i<openingBrackets+1;++i) {
					append(identLevel + "}");
					identLevel = identLevel.substr(0,identLevel.length-1);
				}
				break;
			case forth.Types.Body:
				code_tree.body.forEach(function(entry) {
					out += generateCode(entry, level+1);
				});
				break;

			case forth.Types.Call:
				var name = forth.mangleName(code_tree.name);
				var splitted = name.split(".");
				var ctxt = splitted.slice(0, splitted.length-1).join(".");
				if(ctxt && ctxt != "") {
					append("forthFunctionCall(stack," + name + ", " + ctxt + ", \"" + name + "\");");
				} else {
					append("forthFunctionCall(stack," + name + ", undefined, \"" + name + "\");");
				}
				break;

			// we ignore CommentLines and CommentParentheses
			case forth.Types.CommentLine:
			case forth.Types.CommentParentheses:
				break;

			case forth.Types.DoLoop:
				var idx = forth.mangleName(code_tree.index);

				append("(function() {");
				append("var " + idx + "_increment=stack.pop();");
				append("var " + idx + "_end=stack.pop();");
				append("var " + idx + "_start=stack.pop();");

				append("if(" + idx + "_start == " + idx + "_end) {");
					append("if(" + idx + "_increment == 0) {");
						append("for(var " + idx + "=" + idx + "_start; " +
							idx + "<" + idx + "_end;) {");
						out += generateCode(code_tree.body, level);
						append("}");
					append("}");
				append("} else if(" + idx + "_start < " + idx + "_end) {");
					append("if(" + idx + "_increment < 0) " + idx + "_increment *= -1;");
					append("for(var " + idx + "=" + idx + "_start; " +
						idx + "<" + idx + "_end;" + idx + "+= " + idx + "_increment) {");
					out += generateCode(code_tree.body, level);
					append("}");
				append("} else {");
					append("if(" + idx + "_increment > 0) " + idx + "_increment *= -1;");
					append("for(var " + idx + "=" + idx + "_start; " +
						idx + ">" + idx + "_end;" + idx + "+= " + idx + "_increment) {");
					out += generateCode(code_tree.body, level);
					append("}");
				append("}");

				append("}());");
				break;

			case forth.Types.FunctionForth:
				var name = forth.mangleName(code_tree.name);
				if(name.indexOf(".") != -1)
					throw new Error("Function names can not contain .");
				append("function " + name + "(stack) {");
				out += generateCode(code_tree.body, level);
				append("}");
				append(name + ".forth_function=true;\n");
				break;
			case forth.Types.FunctionForthAnonymous:
				append("stack.push({forth_function_anonymous: true,");
				append("execute: function(stack) {");
				out += generateCode(code_tree.body, level);
				append("}");
				append("});");
				break;

			case forth.Types.FunctionJs:
				var name = forth.mangleName(code_tree.name);
				if(name.indexOf(".") != -1)
					throw new Error("Function names can not contain .");
				var args = code_tree.args.map(forth.mangleName).join(", ");
				append("function " + name + "(" + args + ") {");
				append(indent_characters + "var stack = new ForthStack();");
				out += generateCode(code_tree.body, level);
				if(code_tree.returnValue)
					append(" return stack.pop();");
				append("}");
				break;
			case forth.Types.FunctionJsAnonymous:
				var args = code_tree.args.map(forth.mangleName).join(", ");
				append("stack.push(function(" + args + ") {");
				append(indent_characters + "var stack = new ForthStack();");
				out += generateCode(code_tree.body, level);
				if(code_tree.returnValue)
					append(" return stack.pop();");
				append("});");
				break;

			case forth.Types.JsCode:
				var clean = code_tree.body.replaceAll(" ", "").replaceAll("\t", "").replaceAll("\n", "").replaceAll("\r", "");
				if(clean && clean != "")
					append(code_tree.body + ";");
				break;
			case forth.Types.JsCodeDirect:
				var clean = code_tree.body.replaceAll(" ", "").replaceAll("\t", "").replaceAll("\n", "").replaceAll("\r", "");
				if(clean && clean != "")
					append(code_tree.body);
				break;
			case forth.Types.JsCodeWithReturn:
				append("stack.push(" + code_tree.body + ");");
				break;
			case forth.Types.Macro:
				if(code_tree.name.indexOf(".") != -1)
					throw new Error("Macros names can not contain .");

				var name = forth.mangleName(code_tree.name);

				append("if(forth_macros[\"" + name + "\"]) throw new Error(\"A macro with the name " + code_tree.name + " is already defined\");");
				append("forth_macros[\"" + name + "\"] = " + JSON.stringify(code_tree) + ";\n");

				break;
			case forth.Types.Number:
				append("stack.push(" + code_tree.value + ");");
				break;
			case forth.Types.String:
				append("stack.push(\"" + code_tree.value + "\");");
				break;
			case forth.Types.TryCatchFinally:
				append("try {");
					out += generateCode(code_tree.body, level+1);
				append("} catch( " + code_tree.catchVar + ") {");
					out += generateCode(code_tree.catchBody, level+1);
				if(code_tree.finallyBody) {
					append("} finally {");
					out += generateCode(code_tree.finallyBody, level+1);
				}
				append("}");
				break;
			case forth.Types.ValueLocal:
				code_tree.values.forEach(function(entry) {
					var name = forth.mangleName(entry);
					append("var " + name + " = stack.pop();");
				});
				break;
			default:
				console.log("Unknown type=" + code_tree.type);
				console.log("Unknown " + JSON.stringify(code_tree, null, "\t"));
		}

		return out;
	}

	return generateCode(code_tree, -1);
};

forth.compile = function(code) {
	var tokens = forth.tokenize(code)
	Filesystem.writeFileSync("generated-tokens.json", JSON.stringify(tokens, null, "\t"));
	var code_tree = forth.createFromForthTokens(tokens);
	Filesystem.writeFileSync("generated-code_tree.json", JSON.stringify(code_tree, null, "\t"));
	var generated_code = forth.generateJsCode(code_tree);
	Filesystem.writeFileSync("generated-code.js", generated_code);
	return generated_code;
}
