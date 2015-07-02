var snabbdom = require("snabbdom");
var snabbdom_h = require("snabbdom/h");
var snabbdom_patch = snabbdom.init([
    require('snabbdom/modules/props'),
    require('snabbdom/modules/eventlisteners'),
    require('snabbdom/modules/class'),
    require('snabbdom/modules/style')
]);

var vdom_diff = require('virtual-dom/diff');
var vdom_patch = require('virtual-dom/patch');
var vdom_createElement = require('virtual-dom/create-element');
var vdom_h = require('virtual-dom/h');

var vdomPatchLive = require('../index');

var patchSnabbdom = function(render, patchData) {
    if(!patchData.domElement) {
        patchData.domElement = document.createElement("div");
        patchData.vNode = snabbdom_patch(patchData.domElement, snabbdom_h("div", [render(snabbdom_h)]));
        document.getElementById("container").appendChild(patchData.domElement);
    } else {
        patchData.vNode = snabbdom_patch(patchData.vNode, snabbdom_h("div", [render(snabbdom_h)]));
    }
    return patchData;
};

var patchVirtualDom = function(render, patchData) {
    if(!patchData.domElement) {
        patchData.vNode = render(vdom_h);
        patchData.domElement = vdom_createElement(patchData.vNode);
        document.getElementById("container").appendChild(patchData.domElement);
    } else {
        patchData.vNode = vdom_diff(patchData.vNode, render(vdom_h));
        patchData.domElement = vdom_patch(patchData.domElement, patchData.vNode);
    }
    return patchData;
};

var changeLib = function (lib) {
    var element = document.getElementById("container");
    element.innerHTML = "";
    var patch = null;
    var view = null;
    if (lib == "vdom") {
        patch = patchVirtualDom;
    } else if (lib == "snabbdom") {
        patch = patchSnabbdom;
    } else {
        return;
    }

    var clickTime = "?";

    vdomPatchLive(patch, function (renderLive) {
        renderLive(function (h) {
            if (lib == "vdom") {
                return h("button", {
                    onclick: function (e) {
                        clickTime = new Date().getTime();
                    }
                }, "virtual-dom click on: " + clickTime);
            } else if (lib == "snabbdom") {
                return h("button", {
                    on: {
                        click: function (e) {
                            clickTime = new Date().getTime();
                        }
                    }
                }, "snabbdom click on: " + clickTime);
            }
        });
    });
};

window.addEventListener('DOMContentLoaded', function () {

    document.getElementById("cmbVDom").onchange = function () {
        changeLib(this.value)
    }
});