//

var PrettyPrinter = function() {

	var self = {};

		/**
		 * creates a pretty representation of the given text.
		 */
		var prettyPrintSelection = function( text ) {
			return syntaxHighlight(JSON.stringify(JSON.parse(text), undefined, 4));
		}

    // thank you: http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
		function syntaxHighlight(json) {
		    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		        var cls = 'color: darkorange;';
		        if (/^"/.test(match)) {
		            if (/:$/.test(match)) {
		                cls = 'color: red;';
		            } else {
		                cls = 'color: green;';
		            }
		        } else if (/true|false/.test(match)) {
		            cls = 'color: blue;';
		        } else if (/null/.test(match)) {
		            cls = 'color: magenta;';
		        }
		        return '<span style="' + cls + '">' + match.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/,/g, ",\n") + '</span>';
		    });
		}

    /**
    * Changes the page and includes the pretty printed text.
    **/
    var prettify = function( selection ) {

			  var prettyText = prettyPrintSelection(selection);

				insertElement(document.body, selection, function(node, match, offset) {
            var prettyNode = document.createElement("span");
            prettyNode.appendChild(document.createElement('pre')).innerHTML = prettyText;
            prettyNode.className="prettyText";
            return prettyNode;
        });
    }

		var insertElement = function(node, selection, callback, excludeElements) {

        excludeElements || (excludeElements = ['script', 'style', 'a', 'form', 'iframe', 'canvas']);
        var child = node.firstChild;

        while (child) {
            switch (child.nodeType) {
            case 1:
                if (excludeElements.indexOf(child.tagName.toLowerCase()) > -1)
                    break;
                insertElement(child, selection, callback, excludeElements);
                break;
            case 3:
                var bk = 0;
                child.data.replace(selection, function(all) {
                    var args = [].slice.call(arguments),
                        offset = args[args.length - 2],
                        newTextNode = child.splitText(offset+bk), tag;
                    bk -= child.data.length + all.length;

                    newTextNode.data = newTextNode.data.substr(all.length);
                    tag = callback.apply(window, [child].concat(args));
                    child.parentNode.insertBefore(tag, newTextNode);
                    child = newTextNode;
                });
                break;
            }
            child = child.nextSibling;
        }

        return node;
    };

    self.prettify = prettify;
    return self;
}

/*
 * Triggered from the background script each time, the icon is clicked.
 */
var initPrettyPrinter = function() {

    var selectionPrettifier = PrettyPrinter();
		var selection = window.getSelection().toString();
		if(selection!==undefined) {
				selectionPrettifier.prettify(selection);
		}
}

initPrettyPrinter();
