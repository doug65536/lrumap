/* unittests: lrumap */
;(function(global) {
    if (module && module.exports) {
        console.log('node');
        module.exports = LruMap;
    } else if (global.define) {
        global.define(LruMap);
    } else {
        global.LruMap = LruMap;
    }

    function LruMap(options) {
        if (typeof options === 'number')
            options = { limit: options };

        this._lookup = {};
        this._head = null;
        this._tail = null;
        this._count = 0;
    }
    LruMap.prototype.peek = peek;
    LruMap.prototype.set = set;
    LruMap.prototype.get = get;
    LruMap.prototype.del = del;
    LruMap.prototype.has = has;
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
        return hOP(this._lookup, key);
    }
    
    // Returns true if the key existed,
    // without updating LRU list
    function peek(key) {
        return hOP(this._lookup, key) && this._lookup[key].value;
    }
    
    // Returns true if the key already existed
    function set(key, value) {
        var node;
        if (hOP(this._lookup, key)) {
            // Update
            node = this._lookup[key];
            node.value = value;
            remove.call(this, node);
            append.call(this, node);
            return true;
        } else {
            // New
            node = new Node(key, value);
            this._lookup[key] = node;
            append.call(this, node);
            return false;
        }
    }
    
    function get(key) {
        var node;
        if (hOP(this._lookup, key)) {
            node = this._lookup[key];
            remove.call(this, node);
            append.call(this, node);
            return node.value;
        }
    }
    
    function del(key) {
        var node;
        if (hOP(this._lookup, key)) {
            node = this._lookup[key];
            remove.call(this, node);
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
    
    // Call the callback with the oldest item first,
    // followed by progressively newer items,
    // until the callback returns not undefined
    function someOldest(callback, thisArg) {
        var node, 
            next,
            response;
        for (node = this._head; node; node = next) {
            next = node.next;
            response = callback.call(thisArg, node.value, node.key, this);
            if (response !== undefined)
                return response;
        }
    }
    
    // Call the callback with the newest item first,
    // followed by progressively older items,
    // until the callback returns not undefined
    function someNewest(callback) {
        var node,
            response;
        for (node = this._tail; node; node = node.prev) {
            response = callback.call(thisArg, node.value, node.key, this);
            if (response !== undefined)
                return response;
        }
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
            remove.call(this, node);
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
            remove.call(this, node);
        }
    }
    
    // Internals --
    
    function Node(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
    
    function append(node) {
        node.prev = this._tail;
        node.next = null;
        if (this._tail) {
            this._tail.next = node;
            this._tail = node;
        } else {
            this._head = node;
            this._tail = node;
        }
        ++this._count;
    }
    
    function remove(node) {
        if (this._head === this._tail) {
            // Remove last node
            this._head = null;
            this._tail = null;
        } else if (node === this._head) {
            // Remove first node
            node.next.prev = null;
            this._head = node.next;
        } else if (node === this._tail) {
            // Remove last node
            node.prev.next = null;
            this._tail = node;
        }
        node.next = null;
        node.prev = null;
        --this._count;
    }
    
    function hOP(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }
}(this));
