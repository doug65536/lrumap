# LruMap

![Build Status](https://api.travis-ci.org/doug65536/lrumap.svg)

## Synopsis

A fast key/value pair storage container with O(1) access to
newest and oldest nodes, and O(n) iteration in forward or 
reverse order (LRU or MRU first).

Never does a linear search, maintains a linked list of nodes
for items, and uses an object for fast key lookup by property.

The key must be a string. If it is not a string, it will
be converted automatically with String(key) by all methods.

## Installing

`npm install ???`  *not published yet*

## Example:
```
var LruMap = require('lrumap');

var testmap = new LruMap();

testmap.set('a', 'alpha');
testmap.set('z', 'omega');

console.log('stored', testmap.length, 'items');
console.log('stored', testmap.get('a'));
console.log('stored', testmap.get('z'));

testmap.someOldest(function(value, key) {
    console.log(key, '=', value);
});

testmap.length = 0;
```

## API

### `length`

When read, this returns the number of keys in the map

When set to a number less than the current length, the
oldest keys are disposed, in oldest first order.

### `set(key, value)`

Returns `false` if the key was created.
Returns `true` if the key already existed.

Creates or updates an entry in the map with the specified
key and value. 

Updates the LRU data to treat *key* as the most recently
used key.

### `get(key)`

Returns `undefined` if the key did not exist.
Returns the stored value if the key existed.

Updates the LRU data to treat this key as the most recently
used key.

### `peek(key)`

Returns `undefined` if the key did not exist.

Returns the stored value if the key existed.

Does not update LRU data.

### `del(key)`

Removes the key from the map.

Returns `true` if the key existed.

Returns `false` if the key did not exist.

### `has(key)`

Returns `true` if the key exists.

Returns `false` if the key does not exist.

Does not update LRU data.

### `newestKey()`

Returns `undefined` if the map is empty.

Returns the key of most recently used 
entry if the map is not empty.

### `oldestKey()`

Returns `undefined` if the map is empty.

Returns the key of least recently used 
entry if the map is not empty.

### `newestValue()`

Returns `undefined` if the map is empty.

Returns the value of most recently used 
entry if the map is not empty.

### `oldestValue()`

Returns `undefined` if the map is empty.

Returns the value of least recently used 
entry if the map is not empty.

### `keys()`

Returns an array of all keys in the map.

It is guaranteed to be in the same order as the
values returned by [`values()`](#values), only if the
map has not been changed between the calls.

### `values()`

Returns an array of all values in the map.

It is guaranteed to be in the same order as the
values returned by [`keys()`](#keys), only if the
map has not been changed between the calls.

### `someNewest(callback, thisArg)`

The callback is called once for each item, in order, 
starting at the newest (most recently used) item.

The iteration will end and no more callbacks will
occur if the callback returns `true`. All other values
will be ignored and the iteration will continue.
This is consistent with the behavior of
[`Array.prototype.some`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some).

**`callback`** defined as `function(value, key, map)`

**`this`** is set to the value supplied in `thisArg`

**`value`** is the value of the item.

**`key`** is the key of the item.

**`map`** is the LruMap instance being iterated.

### `someOldest(callback, thisArg)`

The callback is called once for each item, in order, 
starting at the oldest (least recently used) item.

The iteration will end and no more callbacks will
occur if the callback returns `true`. All other values
will be ignored and the iteration will continue.
This is consistent with the behavior of
[`Array.prototype.some`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some).

**`callback`** defined as `function(value, key, map)`

**`this`** is set to the value supplied in `thisArg`

**`value`** is the value of the item.

**`key`** is the key of the item.

**`map`** is the LruMap instance being iterated.


## Running unit tests

If you clone or fork this repository, you can run the
included unit tests by executing the following command:

`npm test`

If you want to auto-run tests on save,
[TDD](https://en.wikipedia.org/wiki/Test-driven_development)
style, I suggest `nodemon`.

```
sudo npm install -g nodemon
nodemon -x 'npm test'
```
