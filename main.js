'use strict';


exports.load = function () {

};

exports.unload = function () {

};

exports.messages = {
    open () {
        Editor.Panel.open('ssh');
        Editor.Metrics.trackEvent({
            category: 'Packages',
            label: 'ssh',
            action: 'Panel Open'
        }, null);
    }
};
