/*
 * The MIT License (MIT). See LICENCE file for more information
 * Copyright (c) 2015 Doug Gale
 */

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
        this._options = options || {};
    }
    LruMap.prototype = {
        constructor: LruMap,
        
        peek: peek,
        set: set,
        get: get,
        del: del,
        has: has,

        oldestKey: oldestKey,
        newestKey: newestKey,

        oldestValue: oldestValue,
        newestValue: newestValue,

        someOldest: wrap2(some, false),
        someNewest: wrap2(some, true),

        mapOldest: wrap2(map, false),
        mapNewest: wrap2(map, true),

        reduce: wrap2(reduce, false),
        reduceRight: wrap2(reduce, true),

        oldestKeys: wrap(keys, false),
        newestKeys: wrap(keys, true),

        oldestValues: wrap(values, false),
        newestValues: wrap(values, true),

        delNewestWhile: wrap2(delWhile, true),
        delOldestWhile: wrap2(delWhile, false),
    };
    
    Object.defineProperty(LruMap.prototype, 'length', {
        set: function(value) {
            if (value < this._count) {
                this.delOldestWhile(function() {
                    return this._count > value;
                }, this);
            }
        },
        get: function() {
            return this._count;
        }
    });
    
    function wrap2(fn, firstArg) {
        return function(a, b) {
            return fn.call(this, firstArg, a, b);
        };
    }
    
    function wrap(fn, arg) {
        return function() {
            return fn.call(this, arg);
        };
    }
    
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
            // If not at the end already
            if (node.next) {
                // Move it to the end
                remove(this, node);
                append(this, node);
            }
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
            remove(this, node);
            append(this, node);
            return node.value;
        }
    }
    
    function del(key) {
        var node = this._lookup[key];
        if (node !== undefined) {
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
    
    function map(rev, callback, thisArg) {
        var node, next, result = [];
        
        for (node = rev ? this._tail : this._head; node; node = next) {
            next = rev ? node.prev : node.next;
            result.push(callback.call(thisArg, node.value, node.key, this));
        }
        return result;
    }
    
    function keys(rev) {
        var node, next, result = [];
        
        for (node = rev ? this._tail : this._head; node; node = next) {
            next = rev ? node.prev : node.next;
            result.push(node.key);
        }
        return result;
    }
    
    function values(rev) {
        var node, next, result = [];
        
        for (node = rev ? this._tail : this._head; node; node = next) {
            next = rev ? node.prev : node.next;
            result.push(node.value);
        }
        return result;
    }
    
    function some(rev, callback, thisArg) {
        var node, next, response;
        
        for (node = rev ? this._tail : this._head; node; node = next) {
            next = rev ? node.prev : node.next;
            response = callback.call(thisArg, node.value, node.key, this);
            if (response === true)
                return true;
        }
        return false;
    }
    
    function reduce(rev, callback, initial) {
        var node, next, response;
        
        node = rev ? this._tail : this._head;
        if (arguments.length === 1) {
            initial = node.value;
            node = node.next;
        }
        for ( ; node; node = next) {
            next = rev ? node.prev : node.next;
            initial = callback(initial, node.value, node.key, this);
        }
        return initial;
    }
    
    function delWhile(rev, callback, thisArg) {
        var node, 
            next,
            response;
        for (node = rev ? this._tail : this._head; node; node = next) {
            next = rev ? node.prev : node.next;
            response = callback.call(thisArg, node.value, node.key, this);
            if (!response)
                return response;
            
		    if (this._options.dispose)
                this._options.dispose(node.value, node.key, this);

            delete this._lookup[node.key];
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
        if (node.prev)
            node.prev.next = node.next;
        else
            map._head = node.next;
        
        if (node.next)
            node.next.prev = node.prev;
        else
            map._tail = node.prev;

        --map._count;
    }
}(this));
