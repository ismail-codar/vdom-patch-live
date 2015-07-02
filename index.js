var requestAnimationFrame = require('raf');
var zoneWrapper = require('zone.js');

module.exports = function (patch, zoneCode) {
    var redrawList = [];
    var isRendering = false;

    var factory = function (render) {
        var patchData = {};
        patch(render, patchData);
        var redrawId = null;

        function requestRedraw() {
            if (redrawId === null) {
                redrawId = requestAnimationFrame(function () {
                    redrawId = null;
                    // clean up
                    if (!patchData.domElement.parentNode) {
                        redrawList.splice(redrawList.indexOf(requestRedraw), 1);
                        return;
                    }
                    // ensure entire patch operation is done within the zone run for proper handler attachment
                    isRendering = true; // avoid triggering a re-render.
                    currentZone.run(function () {
                        patch(render, patchData);
                    });
                    isRendering = false;
                });
            }
        }
        redrawList.push(requestRedraw);
    };

    var currentZoneIsInitialized = false;
    var currentZone = zoneWrapper.zone.fork({
        afterTask: function () {
            if (currentZoneIsInitialized && !isRendering) {
                redrawList.forEach(function (hook) { hook(); });
            }
        }
    });

    currentZoneIsInitialized = true;
    currentZone.run(function () {
        zoneCode(factory);
    });
};