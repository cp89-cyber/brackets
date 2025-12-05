define(function (require, exports, module) {
    "use strict";

    var MainViewManager = brackets.getModule("view/MainViewManager"),
        EditorManager   = brackets.getModule("editor/EditorManager");

    function _handleKeypress(event, editor, domEvent) {
        var char = String.fromCharCode(domEvent.which || domEvent.keyCode);
        var map = {
            "'": "'",
            '"': '"',
            "(": ")",
            "{": "}",
            "[": "]"
        };

        if (map[char]) {
            var doc = editor.document;
            var selection = editor.getSelection();
            var cursor = editor.getCursorPos();

            if (editor.hasSelection()) {
                // Wrap selection
                // Note: selection object has start/end, but text property might need to be fetched if not present in simplified object
                // Let's use getSelectedText() or just use the range.
                // Brackets Editor.getSelection() returns {start, end, reversed}. It doesn't seem to have .text property directly documented in general CM usage, but Brackets might wrap it.
                // Safer to use doc.getRange(selection.start, selection.end)
                var selectedText = doc.getRange(selection.start, selection.end);
                
                doc.replaceRange(char + selectedText + map[char], selection.start, selection.end);
                
                // Select the inner text
                // Start is shifted by 1 char
                editor.setSelection(
                    {line: selection.start.line, ch: selection.start.ch + 1},
                    {line: selection.end.line, ch: selection.end.ch + 1}
                );
            } else {
                // Insert both
                doc.replaceRange(char + map[char], cursor);
                // Move cursor to between them
                editor.setCursorPos(cursor.line, cursor.ch + 1);
            }
            
            // Prevent default insertion
            domEvent.preventDefault();
        }
    }

    // We need to attach to any active editor
    // MainViewManager.on("currentFileChange", ...) handles file switching
    // We also need to handle the initial editor if one is open ? 
    // Usually extensions load early.
    
    function attach(editor) {
        if (!editor) return;
        // removing first to avoid duplicates
        editor.off("keypress", _handleKeypress);
        editor.on("keypress", _handleKeypress);
    }
    
    MainViewManager.on("currentFileChange", function () {
        var editor = EditorManager.getCurrentFullEditor();
        attach(editor);
    });
    
    // Also attach to the current one immediately if it exists (e.g. reload without full restart)
    // or if the event fired before we loaded?
    // Not strictly necessary if we only care about user actions which happen after load.
});
