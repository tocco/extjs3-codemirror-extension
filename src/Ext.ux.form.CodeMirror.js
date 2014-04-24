/*
 * Copyright 2014 Tocco AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Parts based on: http://www.sencha.com/forum/showthread.php?88433-Ext.ux.form.CodeMirror
 *
 * Available at: https://github.com/tocco/extjs3-codemirror-extension
 */

Ext.ns("Ext.ux.form");

/**
 * @class Ext.ux.form.CodeMirror
 * @extends Ext.form.TextArea
 * @xtype codemirror
 *
 * @author Urs Wolfer
 */
Ext.ux.form.CodeMirror = Ext.extend(Ext.form.TextArea, {

    /**
     * Any valid CodeMirror language mode. Required.
     */
    mode: null,

    /**
     * Can be specified when mode is not equal to mode javascript file. Optional.
     */
    modeJs: null,

    /**
     * Path to CodeMirror folder. Required.
     */
    codeMirrorPath: null,

    /**
     * Any valid CodeMirror config option (will be passed over to CodeMirror instance).
     */
    codeMirrorConfig: {},

    initComponent: function () {
        Ext.ux.form.CodeMirror.superclass.initComponent.apply(this, arguments);

        // code from: http://codemirror.net/demo/fullscreen.html
        function isFullScreen(cm) {
            return /\bCodeMirror-fullscreen\b/.test(cm.getWrapperElement().className);
        }
        function winHeight() {
            return window.innerHeight || (document.documentElement || document.body).clientHeight;
        }
        function setFullScreen(cm, full) {
            var wrap = cm.getWrapperElement();
            if (full) {
                wrap.className += " CodeMirror-fullscreen";
                wrap.style.height = winHeight() + "px";
                document.documentElement.style.overflow = "hidden";
            } else {
                wrap.className = wrap.className.replace(" CodeMirror-fullscreen", "");
                wrap.style.height = "";
                document.documentElement.style.overflow = "";
            }
            cm.refresh();
        }
        CodeMirror.on(window, "resize", function() {
            var showing = document.body.getElementsByClassName("CodeMirror-fullscreen")[0];
            if (!showing) return;
            showing.CodeMirror.getWrapperElement().style.height = winHeight() + "px";
        });
        // end copied code


        if (!this.codeMirrorPath) {
            throw "Ext.ux.form.CodeMirror: codeMirrorPath required";
        }
        if (!this.mode) {
            throw "Ext.ux.form.CodeMirror: mode required";
        }
        this.initialized = false;
        this.on({
            resize: function (self, width, height) {
                if (!self.initialized) return;
                var style = this.codeEditor.getScrollerElement().style;
                style.width = width + "px";
                if (!self.grow) {
                    style.height = height + "px";
                }
                this.codeEditor.refresh();
            },
            afterrender: function () {
                var self = this;

                var config = {
                    mode: self.mode,
                    lineWrapping: true,
                    matchBrackets: true,
                    lineNumbers: true,
                    viewportMargin: Infinity,

                    extraKeys: {
                        "F11": function(cm) {
                            setFullScreen(cm, !isFullScreen(cm));
                        },
                        "Esc": function(cm) {
                            if (isFullScreen(cm)) setFullScreen(cm, false);
                        }
                    }
                };

                Ext.applyIf(self.codeMirrorConfig, config);

                self.codeEditor = CodeMirror.fromTextArea(self.el.dom, self.codeMirrorConfig);
                self.codeEditor.on("change", function(/*cm, change*/) {
                    self.fireEvent("change", self, self.codeEditor.getValue());
                });
                self.codeEditor.on("blur", function(/*cm*/) {
                    self.fireEvent("blur", self);
                });
                CodeMirror.modeURL = self.codeMirrorPath + "/mode/%N/%N.js";
                (function(){
                    CodeMirror.autoLoadMode(self.codeEditor, self.modeJs || self.mode);
                }).defer(201); // magic number of 200 is defined in CodeMirror.requireMode...

                self.initialized = true;
                self.codeEditor.getWrapperElement().style.backgroundColor = "#fff";
                self.codeEditor.getWrapperElement().style.border = "1px solid #B5B8C8";
                (function() {
                    self.codeEditor.refresh();
                }).defer(1);
            }
        }, this);
    },

    getValue: function() {
        if (this.initialized) {
            this.codeEditor.save();
        }
        return Ext.ux.form.CodeMirror.superclass.getValue.apply(this, arguments);
    },

    setValue: function(v) {
        var self = this;
        if (this.initialized) {
            this.codeEditor.setValue(v || ''); // code mirror fails with a non-string-value
            (function(){
                self.codeEditor.refresh(); // required, otherwise at least chrome displays old content until first change in editor
            }).defer(1);
        }
        return Ext.ux.form.CodeMirror.superclass.setValue.apply(this, arguments);
    },

    validate: function() {
        this.getValue();
        Ext.ux.form.CodeMirror.superclass.validate.apply(this, arguments);
    }
});

Ext.reg("codemirror", Ext.ux.form.CodeMirror);
