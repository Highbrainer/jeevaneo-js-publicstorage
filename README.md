# publicstorage
A NPM package that will allow pages from cross-domains to share persistent data.

The `publicstorage` acts as a kind of `localstorage` (or `sessionstorage`) that is publicly available from any domain. This allows for web pages from different domains to share data really easily.
 
## Examples of use

### Setting and getting 'public' data

Getting or setting data is an asynchronous job - so that it never blocks the UI. Everything is wrapped in Promise : 
    
#### Set key/value ####

```javascript 
publicstorage.set("test", "my value here ").then(v => {
	console.log("I set value test=" + v);
});
``` 
    
#### Get value by key ####

```javascript 
publicstorage.get("test").then(v => {
	console.log("I got value test=" + v);
});
``` 
    
#### Data can also be structured ####

```javascript 
publicstorage.set("test", {my : "value", is:"here"}).then(v => {
	console.log("I set value test=" + v);
});

publicstorage.get("test").then(v => {
	console.log("I got value test=" + JSON.stringify(v));
});
``` 
    
### Initialization

`publicstorage` cannot work before the body is available - though it is only made available when the page is fully loaded - that means after the `onLoad` event has been triggered. That's why the package export is a Promise : 

```javascript 
var publicstoragePromise = require('publicstorage');

publicstoragePromise.then(publicstorage => {
	// your code here - use the publicstorage from there !
});
``` 
    
### Security warning
    
This implementation aims at *sharing* data between domains. This means there is no control on who reads or writes the data.
<aside class="warning"> 
**Do not use this means as-is with confidential or sensitive data!**
</aside>
In case you need to ensure only a controled set of domains can access the data, you will need to fork the code and modify the shared-iframe.html component.