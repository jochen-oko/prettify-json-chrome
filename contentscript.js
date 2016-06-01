//

var PrettyPrinter = function() {

	var self = {};

		/**
		 * creates a pretty representation of the given text.
		 */
		var prettyPrintSelection = function( text ) {

			var json = JSON.parse(text);
			// console.log("completed json parsing: ", json);

			var stringified = JSON.stringify(json, undefined, 4);
			// console.log("completed json stringification: ", stringified);

			var highlighted = syntaxHighlight(stringified);
			// console.log("completed json highlight: ", highlighted);

			return highlighted;
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

		function getSelectedNode(isStart) {
				var range, sel, container;

				sel = window.getSelection();
				if (sel.getRangeAt) {
						if (sel.rangeCount > 0) {
								range = sel.getRangeAt(0);
						}
				} else {
						range = document.createRange();
						range.setStart(sel.anchorNode, sel.anchorOffset);
						range.setEnd(sel.focusNode, sel.focusOffset);

						// Handle the case when the selection was selected backwards (from the end to the start in the document)
						if (range.collapsed !== sel.isCollapsed) {
								range.setStart(sel.focusNode, sel.focusOffset);
								range.setEnd(sel.anchorNode, sel.anchorOffset);
						}
			 }

				if (range) {
					 container = range[isStart ? "startContainer" : "endContainer"];

					 // Check if the container is a text node and return its parent if so
					 return container.nodeType === 3 ? container.parentNode : container;
				}

		}

    /**
     * Changes the page and includes the pretty printed text.
     **/
    var prettify = function( selection ) {

			  var prettyText = prettyPrintSelection(selection);
				var prettyNode = document.createElement("div");
				var preNode = document.createElement('pre');
				preNode.style.cssText="outline: 1px solid #ccc; padding: 5px; margin: 5px;";
				prettyNode.appendChild(preNode).innerHTML = prettyText;

				var selectedNode = getSelectedNode();
				console.log("found a match: ", selectedNode.innerHTML.trim().indexOf(selection.trim()) > -1);
				selectedNode.innerHTML = selectedNode.innerHTML.replace(
					selection.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim(),
					prettyNode.innerHTML.trim()
				);
    }

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
