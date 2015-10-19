/* lrumap.js */
;(function(global) {
    if (global.exports) {
        global.exports = LruMap;
    } else if (global.define) {
        global.define(LruMap);
    } else {
        global.LruMap = LruMap;
    }

    function LruMap(options) {
        if (typeof options === 'number')
            options = { limit: options };

        this.lookup = {};
        this.head = null;
        this.tail = null;
        this.count = null;
    }
    LruMap.prototype.peek = peek;
    LruMap.prototype.set = set;
    LruMap.prototype.get = get;
    LruMap.prototype.del = del;
    LruMap.prototype.has = has;
    LruMap.prototype.upd = upd;
    LruMap.prototype.oldestKey = oldestKey;
    LruMap.prototype.newestKey = newestKey;
    LruMap.prototype.oldestValue = oldestValue;
    LruMap.prototype.newestValue = newestValue;
    LruMap.prototype.someOldest = someOldest;
    LruMap.prototype.someNewest = someNewest;
    LruMap.prototype.delOldestUntil = delOldestUntil;
    LruMap.prototype.delNewestUntil = delNewestUntil;
    
    function has(key) {
        return hOP(this.lookup, key);
    }
    
    function peek(key) {
        return hOP(this.lookup, key) && this.lookup[key].value;
    }
    
    // Returns true if the key already existed
    function set(key, value) {
        var node;
        if (hOP(this.lookup, key)) {
            // Update
            node = this.lookup[key];
            node.value = value;
            remove.call(this, node);
            append.call(this, node);
            return true;
        } else {
            // New
            node = new Node(key, value);
            this.lookup[key] = node;
            append.call(this, node);
            return false;
        }
    }
    
    function get(key) {
        var node;
        if (hOP(this.lookup, key)) {
            node = this.lookup[key];
            remove.call(this, node);
            append.call(this, node);
            return node.value;
        }
    }
    
    function del(key) {
        var node;
        if (hOP(this.lookup, key)) {
            node = this.lookup[key];
            remove.call(this, node);
            delete this.lookup[key];
            return true;
        }
        return false;
    }
    
    function oldestKey() {
        return (this.head && this.head.key) || undefined;
    }
    
    function newestKey() {
        return (this.tail && this.tail.key) || undefined;
    }
    
    function oldestValue() {
        return (this.head && this.head.value) || undefined;
    }
    
    function newestValue() {
        return (this.tail && this.tail.value) || undefined;
    }
    
    // Call the callback with the oldest item first,
    // followed by progressively newer items,
    // until the callback returns not undefined
    function someOldest(callback, thisArg) {
        var node, 
            next,
            response;
        for (node = this.head; node; node = next) {
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
        for (node = this.tail; node; node = node.prev) {
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
        for (node = this.head; node; node = next) {
            next = node.next;
            response = callback.call(thisArg, node.value, node.key, this);
            if (response !== undefined)
                return response;
            
            delete this.lookup[key];
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
        for (node = this.tail; node; node = next) {
            next = node.prev;
            response = callback.call(thisArg, node.value, node.key, this);
            if (response !== undefined)
                return response;
            
            delete this.lookup[key];
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
        node.prev = this.tail;
        node.next = null;
        this.tail.next = node;
        this.tail = node;
        ++this.count;
    }
    
    function remove(node) {
        if (this.head === this.tail) {
            // Remove last node
            this.head = null;
            this.tail = null;
        } else if (node === this.head) {
            // Remove first node
            node.next.prev = null;
            this.head = node.next;
        } else if (node === this.tail) {
            // Remove last node
            node.prev.next = null;
            this.tail = node;
        }
        node.next = null;
        node.prev = null;
        --this.count;
    }
    
    function hOP(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }
}(this));
