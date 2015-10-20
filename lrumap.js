/* unittests: lrumap */
;(function(global) {
    "use strict";
    
    if (module && module.exports) {
        module.exports = LruMap;
    } else if (global.define) {
        global.define(LruMap);
    } else {
        global.LruMap = LruMap;
    }

    function LruMap(options) {
        if (typeof options === 'number')
            options = { limit: options };

        this._lookup = Object.create(null);
        this._head = null;
        this._tail = null;
        this._count = 0;
    }
    LruMap.prototype.peek = peek;
    LruMap.prototype.set = set;
    LruMap.prototype.get = get;
    LruMap.prototype.del = del;
    LruMap.prototype.has = has;
    LruMap.prototype.some = some;
    LruMap.prototype.map = map;
    LruMap.prototype.reduce = reduce;
    LruMap.prototype.oldestKey = oldestKey;
    LruMap.prototype.newestKey = newestKey;
    LruMap.prototype.oldestValue = oldestValue;
    LruMap.prototype.newestValue = newestValue;
    LruMap.prototype.someOldest = someOldest;
    LruMap.prototype.someNewest = someNewest;
    LruMap.prototype.delOldestUntil = delOldestUntil;
    LruMap.prototype.delNewestUntil = delNewestUntil;
    
    Object.defineProperty(LruMap.prototype, 'length', {
        set: function(value) {
            if (value < this._count) {
                this.delOldestUntil(function() {
                    if (this._count <= value)
                        return true;
                });
            }
        },
        get: function() {
            return this._count;
        }
    });
    
    function has(key) {
        return this._lookup[key] !== undefined;
    }
    
    // Returns true if the key existed,
    // without updating LRU list
    function peek(key) {
        return this._lookup[key] !== undefined && this._lookup[key].value;
    }
    
    // Returns true if the key already existed
    function set(key, value) {
        if (typeof key !== 'string')
            key = String(key);
        var node = this._lookup[key];
        if (node !== undefined) {
            // Update
            node.value = value;
            remove(this, node);
            append(this, node);
            return true;
        } else {
            // New
            node = new Node(key, value);
            this._lookup[key] = node;
            append(this, node);
            return false;
        }
    }
    
    function get(key) {
        var node = this._lookup[key];
        if (node !== undefined) {
            node = this._lookup[key];
            remove(this, node);
            append(this, node);
            return node.value;
        }
    }
    
    function del(key) {
        var node = this._lookup[key];
        if (node !== undefined) {
            node = this._lookup[key];
            remove(this, node);
            delete this._lookup[key];
            return true;
        }
        return false;
    }
    
    function oldestKey() {
        return (this._head && this._head.key) || undefined;
    }
    
    function newestKey() {
        return (this._tail && this._tail.key) || undefined;
    }
    
    function oldestValue() {
        return (this._head && this._head.value) || undefined;
    }
    
    function newestValue() {
        return (this._tail && this._tail.value) || undefined;
    }
    
    function map(callback, thisArg) {
        var node, next, result = [];
        
        for (node = this._head; node; node = next) {
            next = node.next;
            result.push(callback.call(thisArg, node.value, node.key, this));
        }
        return result;
    }
    
    function some(callback, thisArg) {
        var node, next, response;
        
        for (node = this._head; node; node = next) {
            next = node.next;
            response = callback.call(thisArg, node.value, node.key, this);
            if (response === true)
                return true;
        }
        return false;
    }
    
    function reduce(callback, initial) {
        var node, next, response;
        
        node = this._head;
        if (arguments.length === 1) {
            initial = node.value;
            node = node.next;
        }
        for ( ; node; node = next) {
            next = node.next;
            initial = callback(initial, node.value, node.key, this);
        }
        return initial;
    }
    
    // Call the callback with the oldest item first,
    // followed by progressively newer items,
    // until the callback returns true
    // Returns last callback return value or false
    function someOldest(callback, thisArg) {
        var node, 
            next,
            response;
        for (node = this._head; node; node = next) {
            next = node.next;
            response = callback.call(thisArg, node.value, node.key, this);
            if (response === true)
                return true;
        }
        return false;
    }
    
    // Call the callback with the newest item first,
    // followed by progressively older items,
    // until the callback returns true
    // Returns last callback return value or false
    function someNewest(callback, thisArg) {
        var node,
            response;
        for (node = this._tail; node; node = node.prev) {
            response = callback.call(thisArg, node.value, node.key, this);
            if (response === true)
                return true;
        }
        return false;
    }
    
    // Pass items to the callback, oldest first, until
    // the callback returns not undefined
    // Returns the value returned by the callback
    // Returns undefined if all items deleted
    function delOldestUntil(callback, thisArg) {
        var node, 
            next,
            response;
        for (node = this._head; node; node = next) {
            next = node.next;
            response = callback.call(thisArg, node.value, node.key, this);
            if (response !== undefined)
                return response;
            
            delete this._lookup[key];
            remove(this, node);
        }
    }
    
    // Pass items to the callback, newest first, until
    // the callback returns not undefined
    // Returns the value returned by the callback
    // Returns undefined if all items deleted
    function delNewestUntil(callback, thisArg) {
        var node, 
            next,
            response;
        for (node = this._tail; node; node = next) {
            next = node.prev;
            response = callback.call(thisArg, node.value, node.key, this);
            if (response !== undefined)
                return response;
            
            delete this._lookup[key];
            remove(this, node);
        }
    }
    
    // Internals --
    
    function Node(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
    
    function append(map, node) {
        node.prev = map._tail;
        node.next = null;
        if (map._tail) {
            map._tail.next = node;
            map._tail = node;
        } else {
            map._head = node;
            map._tail = node;
        }
        ++map._count;
    }
    
    function remove(map, node) {
        if (map._head === map._tail) {
            // Remove only node
            map._head = null;
            map._tail = null;
        } else if (node === map._head) {
            // Remove first node
            node.next.prev = null;
            map._head = node.next;
        } else if (node === map._tail) {
            // Remove last node
            node.prev.next = null;
            map._tail = node;
        }
        node.next = null;
        node.prev = null;
        --map._count;
    }
}(this));
