# koa-vhost
A vhost middleware for koa application.

Forked from [koa-vhost](https://github.com/Treri/koa-vhost)
# Install
```javascript
npm i vhost-koa
```
or install from github
```javascript
npm i JiangJie/koa-vhost
```
# example
```javascript
let koa = require('koa');
let mount = require('koa-mount');
let Router = require('koa-router');
let vhost = require('vhost-koa');

let app = koa();

let vhosts = ['127.0.0.1', 'localhost'];

vhosts = vhosts.map(function(item) {
try {
  let vapp = koa();

  let API = new Router();
  API.get('/', function*() {this.body = 'hello';});
  vapp.use(mount('/', API.middleware()));
  return {
    host: item,
    app: vapp
  };
} catch(e) {
  console.log('vhost error %s', e.message);
  return;
}
}).filter(function(item) {
    return !!item;
});
app.use(vhost(vhosts));
```