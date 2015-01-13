'use strict';

var assert = require('assert');
var debug = require('debug')('koa:vhost');
var compose = require('koa-compose');

function isRegExp(obj) {
    return obj.constructor && obj.constructor.name === 'RegExp';
}

function checkParams(host, app) {
    return (typeof host === 'string' || isRegExp(host)) && app && app.middleware && Array.isArray(app.middleware);
}

module.exports = function(host, app) {
    assert.ok(!!host, 'at least need a vhost');

    var vhosts = [];

    // {
    //     host: 'www.example.com',
    //     app: koaapp
    // }
    if(host.host && host.app) {
        host = host.host;
        app = host.app;
    }

    // 'www.example.com', koaapp
    if(checkParams(host, app)) vhosts.push({
        host: host,
        app: app
    });

    // [{
    //     host: 'www.example.com',
    //     app: koaapp
    // }]
    else if(Array.isArray(host) && host.every(function(vhost) {
        var ret = !!vhost && checkParams(vhost.host, vhost.app);
        debug('vhost: %s check %s', vhost.host, ret ? 'success': 'failed');
        return ret;
    })) vhosts = host;

    if(!vhosts.length) throw new Error('vhost error');

    // compose the app's middleware to one middleware
    vhosts.forEach(function(vhost) {
        debug('register vhost: %s', vhost.host);
        vhost.middleware = compose(vhost.app.middleware);
    });

    return function *vhost(next){
        var host = this.hostname;

        var vhost;
        vhosts.some(function(item) {
            if(item.host === host || (isRegExp(item.host) && item.host.test(host))) {
                vhost = item;
                debug('matched host: %s', item.host);
                return true;
            }
            return false;
        });

        if(vhost) return yield* vhost.middleware.call(this, next);

        yield* next;
    }
};