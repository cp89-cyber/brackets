define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus"),
        EditorManager  = brackets.getModule("editor/EditorManager"),
        Commands       = brackets.getModule("command/Commands");

    var MY_COMMAND_ID = "auto_beautify.beautify";

    function beautify() {
        var editor = EditorManager.getFocusedEditor();
        if (!editor) {
            return;
        }

        var codeMirror = editor._codeMirror;
        
        // Use a batch operation for performance and single undo
        codeMirror.operation(function() {
            var lineCount = codeMirror.lineCount();
            for (var i = 0; i < lineCount; i++) {
                codeMirror.indentLine(i, "smart");
            }
        });
    }

    CommandManager.register("Beautify", MY_COMMAND_ID, beautify);

    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    if (menu) {
        // Add divider before if possible, or just add it
        menu.addMenuDivider();
        menu.addMenuItem(MY_COMMAND_ID);
    }
});
