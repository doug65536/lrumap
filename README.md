# LruMap

![Build Status](https://api.travis-ci.org/doug65536/lrumap.svg)

## API

### length

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

### `newestKey()`

Returns `undefined` if the map is empty.

Returns the value of most recently used 
entry if the map is not empty.

### `oldestKey()`

Returns `undefined` if the map is empty.

Returns the value of least recently used 
entry if the map is not empty.

### `someNewest(callback, thisArg)`

callback defined as `function(value, key, map)`

`value` is the value of the item.

`key` is the key of the item.

`map` is the lrumap instance being iterated.


