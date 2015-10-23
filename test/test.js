/*
 * The MIT License (MIT). See LICENCE file for more information
 * Copyright (c) 2015 Doug Gale
 */

"use strict"

var should = require('should'),
    LruMap = require('..');

describe('LruMap', function() {
    it('should construct with no arguments', function() {
        var map = new LruMap();
        should(map).be.instanceOf(LruMap);
        should(map.set).be.Function();
    });
    it('should construct with empty object argument', function() {
        var map = new LruMap({});
        should(map).be.instanceOf(LruMap);
        should(map.set).be.Function();
    });
    it('should construct with nonsense object argument', function() {
        var map = new LruMap({ crazyPropertyName: 123 });
        should(map).be.instanceOf(LruMap);
        should(map.set).be.Function();
    });
    it('should construct with numeric argument', function() {
        var map = new LruMap(123);
        should(map).be.instanceOf(LruMap);
        should(map.set).be.Function();
    });
    it('should have the documented interface', function() {
        var map = new LruMap();
        should(map.length).be.equal(0);
        should(map.set).be.Function;
        should(map.get).be.Function;
        should(map.del).be.Function;
        should(map.has).be.Function;
        should(map.newestKey).be.Function;
        should(map.oldestKey).be.Function;
        should(map.someNewest).be.Function;
        should(map.someOldest).be.Function;
        should(map.oldestValue).be.Function;
        should(map.newestValue).be.Function;
        should(map.delOldestWhile).be.Function;
        should(map.delNewestWhile).be.Function;
    });
    function isEmpty(map) {
        var flag;
        
        should(map.length).be.equal(0);

        should(map.newestKey()).be.undefined;
        should(map.oldestKey()).be.undefined;

        should(map.newestValue()).be.undefined;
        should(map.oldestValue()).be.undefined;

        should(map.oldestKeys()).be.Array;
        should(map.oldestValues()).be.Array;
        should(map.oldestKeys()).be.Array;
        should(map.oldestValues()).be.Array;

        should(map.oldestKeys().length).be.equal(0);
        should(map.oldestValues().length).be.equal(0);
        should(map.oldestKeys().length).be.equal(0);
        should(map.oldestValues().length).be.equal(0);
        
        flag = false;
        map.someOldest(function() {
            flag = true;
        });
        should(flag).be.false;
        
        flag = false;
        map.someNewest(function() {
            flag = true;
        });
        should(flag).be.false;
        
        flag = false;
        should(map.mapOldest(function() {
            flag = true;
        })).be.deepEqual([]);   
        should(flag).be.false;
        
        flag = false;
        should(map.mapNewest(function() {
            flag = true;
        })).be.deepEqual([]);
        should(flag).be.false;
        
        should.throws(function() {
            map.reduce(function() {
                flag = true;
                return true;
            });
        }, TypeError, "Empty reduce with no initial value should throw");
        should(flag).be.false;
        
        should(map.reduce(function() {
            flag = true;
            return true;
        }, false)).be.false;
        should(flag).be.false;
        
        flag = false;
        should(map.reduceRight(function() {
            flag = true;
        }, false)).be.false;
        should(flag).be.false;
    }
    it('should work correctly before setting a key', function() {
        var map = new LruMap();
        
        isEmpty(map);
    });
    it('should store and retrieve data', function() {
        var map = new LruMap();
        should(map.length).be.equal(0);
        should(map.has('a')).be.false;
        should(map.get('a')).be.undefined;
        should(map.newestKey()).be.undefined;
        should(map.oldestKey()).be.undefined;
        should(map.newestValue()).be.undefined;
        should(map.oldestValue()).be.undefined;

        should(map.set('a', 1)).be.false;

        should(map.length).be.equal(1);
        should(map.has('a')).be.true;
        should(map.get('a')).be.equal(1);
        should(map.newestKey()).be.equal('a');
        should(map.oldestKey()).be.equal('a');
        should(map.newestValue()).be.equal(1);
        should(map.oldestValue()).be.equal(1);
   
        should(map.set('a', 1)).be.true;

        should(map.length).be.equal(1);
        should(map.has('a')).be.true;
        should(map.get('a')).be.equal(1);
        should(map.newestKey()).be.equal('a');
        should(map.oldestKey()).be.equal('a');
        should(map.newestValue()).be.equal(1);
        should(map.oldestValue()).be.equal(1);
        
        should(map.set('b', 2)).be.false;

        should(map.length).be.equal(2);
        should(map.has('a')).be.true;
        should(map.get('a')).be.equal(1);
        should(map.get('b')).be.equal(2);
        should(map.newestKey()).be.equal('b');
        should(map.oldestKey()).be.equal('a');
        should(map.newestValue()).be.equal(2);
        should(map.oldestValue()).be.equal(1);
        
        should(map.oldestValues()).be.deepEqual([1, 2]);
        should(map.newestValues()).be.deepEqual([2, 1]);
        
        should(map.oldestKeys()).be.deepEqual(['a', 'b']);
        should(map.newestKeys()).be.deepEqual(['b', 'a']);
    });
    it('should handle deleting first, middle, last', function() {
        var map = new LruMap();

        var populate = function(map) {
            map.length = 0;
            for (var i = 1; i <= 5; ++i)
                map.set(i, 'value_' + i);
        };
        var count = function(map) {
            return map.reduce(function(total) {
                return total + 1;
            }, 0);
        };
        
        populate(map);
        should(map.del('1')).be.true;
        should(map.oldestKey()).be.equal('2');
        should(map.oldestValue()).be.equal('value_2');
        should(map.newestKey()).be.equal('5');
        should(map.newestValue()).be.equal('value_5');
        should(count(map)).be.equal(4);

        populate(map);
        should(map.del('3')).be.true;
        should(map.oldestKey()).be.equal('1');
        should(map.oldestValue()).be.equal('value_1');
        should(map.newestKey()).be.equal('5');
        should(map.newestValue()).be.equal('value_5');
        should(count(map)).be.equal(4);

        populate(map);
        should(map.del('5')).be.true;
        should(map.oldestKey()).be.equal('1');
        should(map.oldestValue()).be.equal('value_1');
        should(map.newestKey()).be.equal('4');
        should(map.newestValue()).be.equal('value_4');
        should(count(map)).be.equal(4);
    });
    it('should preserve value types', function () {
        var map = new LruMap(),
            obj = { duck: true },
            date = new Date(),
            buf = new Buffer('hello', 'utf8'),
            num = 3.14159265358979323,
            arr = [42];
        map.set('string', 'value');
        map.set('object', obj);
        map.set('Buffer', buf);
        map.set('date', date);
        map.set('number', num);
        map.set('true', true);
        map.set('false', false);
        map.set('null', null);
        map.set('NaN', NaN);
        map.set('array', arr);
        map.set('undefined', undefined);
        should(map.length).be.equal(11);
        
        should(map.get('string')).be.equal('value');
        should(map.get('object')).be.equal(obj);
        should(map.get('Buffer')).be.instanceOf(Buffer);
        should(map.get('Buffer')).be.equal(buf);
        should(map.get('date')).be.equal(date);
        should(map.get('date')).be.equal(date);
        should(map.get('number')).be.equal(num);
        should(map.get('true')).be.true;
        should(map.get('false')).be.false;
        should(map.get('null')).be.equal(null);
        should(map.get('NaN')).be.NaN;
        should(map.get('array')).be.equal(arr);
        should(map.get('undefined')).be.undefined;
    });
    it('should not initially have any keys from Object', function () {
        var map = new LruMap(),
            key;
        Object.getOwnPropertyNames(Object.getPrototypeOf({}))
        .forEach(function(key) {
            should(map.has(key)).be.false;
            should(map.get(key)).be.undefined;
        });
    });
    it('should remove keys properly', function () {
        var map = new LruMap();
        should(map.has('1')).be.false;
        should(map.length).be.equal(0);
        should(map.set('1', 'a')).be.false;
        should(map.length).be.equal(1);
        should(map.has('1')).be.true;
        should(map.del('1')).be.true;
        should(map.oldestValue()).be.undefined;
        should(map.has('1')).be.false;
        should(map.del('1')).be.false;
        should(map.length).be.equal(0);
    });
    it('should update lru order when getting', function () {
        var map = new LruMap(),
            chk,
            expect,
            index,
            checked;
        for (var i = 1; i <= 10; ++i)
            map.set(i, 'value' + i);

        chk = [
            3, 7, 4, 1, 3, 4
        ];
        
        expect = [
            2, 5, 6, 8, 9, 10, 7, 1, 3, 4
        ];
        
        chk.forEach(function(value) {
            map.get(value);
        });
        
        index = 0;
        checked = 0;
        map.someOldest(function(value, key, passedMap) {
            ++checked;
            should(key).be.equal(expect[index++].toString());
        });
        should(checked).be.equal(10);
    });
    it('should ignore attempts to increase the length', function() {
        var map = new LruMap();
        map.length = -1;
        should(map.length).be.equal(0);
        
        for (var i = 0; i < 10; ++i)
            map.set(i, 'value_' + i);

        map.length = i * 2 + 1;
        should(map.length).be.equal(i);
    });
    it('should dispose the oldest keys if you decrease the length', function() {
        var map = new LruMap();

        for (var i = 0; i < 5; ++i)
            map.set(i, 'value_' + i);
        
        should(map.length).be.equal(5);
        map.length = 3;
        should(map.length).be.equal(3);
        
        should(map.has('0')).be.false;
        should(map.has('1')).be.false;
        should(map.has('2')).be.true;
        should(map.has('3')).be.true;
        should(map.has('4')).be.true;

        should(map.oldestKey()).be.equal('2');
        should(map.oldestValue()).be.equal('value_2');

        should(map.newestKey()).be.equal('4');
        should(map.newestValue()).be.equal('value_4');
    });
    it('should completely clear the map if you set the length to zero', function() {
        var map = new LruMap();

        for (var i = 0; i < 5; ++i)
            map.set(i, 'value_' + i);
        
        map.length = 0;
        
        isEmpty(map);
    });
    it('should insert 10k items fast', function() {
        var map = new LruMap();
        for (var i = 0; i < 10000; ++i)
            map.set(i, 'value' + i);
    });
    it('should insert and remove 10k items 10x (oldest first), fast', function() {
        var map = new LruMap(), rep;
        for (rep = 0; rep < 10; ++rep) {
            for (var i = 0; i < 10000; ++i)
                map.set(i, 'value' + i);
            for (var i = 0; i < 10000; ++i)
                map.del(i);
        }
    });
    it('should insert and remove 10k items 10x (newest first), fast', function() {
        var map = new LruMap(), rep;
        for (rep = 0; rep < 10; ++rep) {
            for (var i = 0; i < 10000; ++i)
                map.set(i, 'value' + i);
            for ( ; i > 0; --i)
                map.del(i-1);
        }
    });
    it('should provide working "some" iterators', function() {
        var map = new LruMap(),
            thisArg = { passed: 42 },
            firstKey;
        
        for (var i = 1; i <= 10; ++i)
            map.set(i, 'value' + i);

        should(map.someOldest(function(value, key, passedMap) {
            should(key).be.instanceOf(String);
            if (firstKey === undefined)
                firstKey = key;
            should(this).be.equal(thisArg);
            should(this.passed).be.equal(42);
            should(passedMap).be.equal(map);
            should(+key).be.within(1, 10);
            should(value).be.equal('value' + key);
        }, thisArg)).be.false;
        should(firstKey).be.equal('1');

        firstKey = undefined;
        should(map.someNewest(function(value, key, passedMap) {
            should(key).be.instanceOf(String);
            if (firstKey === undefined)
                firstKey = key;
            should(this).be.equal(thisArg);
            should(this.passed).be.equal(42);
            should(passedMap).be.equal(map);
            should(+key).be.within(1, 10);
            should(value).be.equal('value' + key);
        }, thisArg)).be.false;
        should(firstKey).be.equal('10')
    });
    it('should provide working "map" iterators', function() {
        var map = new LruMap(),
            thisArg = { passed: 42 },
            firstKey,
            mapped;
        
        for (var i = 1; i <= 10; ++i)
            map.set(i, 'value' + i);

        mapped = map.mapOldest(function(value, key, passedMap) {
            should(key).be.instanceOf(String);
            if (firstKey === undefined)
                firstKey = key;
            should(this).be.equal(thisArg);
            should(this.passed).be.equal(42);
            should(passedMap).be.equal(map);
            should(+key).be.within(1, 10);
            should(value).be.equal('value' + key);
            
            return 'mapped_'+ value;
        }, thisArg);
        should(firstKey).be.equal('1');
        should(mapped).be.Array;
        should(mapped).be.length(10);
        mapped.forEach(function(value, index, mapped) {
            should(value).be.equal('mapped_value' + (index+1));
        });

        firstKey = undefined;
        mapped = map.mapNewest(function(value, key, passedMap) {
            should(key).be.instanceOf(String);
            if (firstKey === undefined)
                firstKey = key;
            should(this).be.equal(thisArg);
            should(this.passed).be.equal(42);
            should(passedMap).be.equal(map);
            should(+key).be.within(1, 10);
            should(value).be.equal('value' + key);
            return 'mapped_' + value;
        }, thisArg);
        should(firstKey).be.equal('10')
        should(mapped).be.Array;
        should(mapped).be.length(10);
        mapped.forEach(function(value, index, mapped) {
            should(value).be.equal('mapped_value' + (10 - index));
        });
    });
    it('should do ordered iterations in the correct order', function() {
        var map = new LruMap(), rep, track, mapped;
        for (var i = 0; i < 10; ++i)
            map.set(i, 'value' + i);

        track = 0;
        should(map.someOldest(function(value, key, passedMap) {
            should(value).be.equal('value' + track);
            should(key).be.equal((track++).toString());
        })).be.false;
        should(track).be.equal(10);
        should(map.someNewest(function(value, key, passedMap) {
            should(key).be.equal((--track).toString());
            should(value).be.equal('value' + track);
        })).be.false;
        should(track).be.equal(0);

        track = 0;
        should(map.mapOldest(function(value, key, passedMap) {
            should(value).be.equal('value' + track);
            should(key).be.equal((track++).toString());
            return key + '=' + value;
        })).be.length(10);
        should(track).be.equal(10);
        should(map.mapNewest(function(value, key, passedMap) {
            should(key).be.equal((--track).toString());
            should(value).be.equal('value' + track);
            return key + '=' + value;
        })).be.length(10);
        should(track).be.equal(0);

        track = 0;
        should(map.reduce(function(total, value, key, passedMap) {
            should(value).be.equal('value' + track);
            should(key).be.equal((track++).toString());
            if (+key & 1)
                return total * (+key);
            else
                return total + (+key);
        }, 42)).be.equal((((((((((42+0)*1)+2)*3)+4)*5)+6)*7)+8)*9);
        should(track).be.equal(10);
        should(map.reduceRight(function(total, value, key, passedMap) {
            should(key).be.equal((--track).toString());
            should(value).be.equal('value' + track);
            if (+key & 1)
                return total * (+key);
            else
                return total + (+key);
        }, 42)).be.equal(((((((((42*9)+8)*7)+6)*5)+4)*3)+2)*1)
        should(track).be.equal(0);
    });
    it('should stop when you return true from some* callback', function () {
        var map = new LruMap(), track, skipped, checked;
        for (var i = 0; i < 10; ++i)
            map.set(i, 'value' + i);
        track = false;
        should(map.someOldest(function(value, key, passedMap) {
            if (+key === 4) {
                track = true;
                return true;
            }
        })).be.true;
        should(track).be.true;
        
        track = false;
        skipped = 0;
        checked = 0;
        should(map.someOldest(function(value, key, passedMap) {
            ++checked;
            if (+key === 4) {
                track = true;
                return true;
            }
            ++skipped;
        })).be.true;
        should(track).be.true;
        should(checked).be.equal(5);
        should(skipped).be.equal(4);
        
        track = false;
        skipped = 0;
        checked = 0;
        should(map.someNewest(function(value, key, passedMap) {
            ++checked;
            if (+key === 4) {
                track = true;
                return true;
            }
            ++skipped;
        })).be.true;
        should(track).be.true;
        should(checked).be.equal(6);
        should(skipped).be.equal(5);
    });
    it('should have working keys() and values()', function() {
        var map = new LruMap(), keys, values, seenKeys = {};
        for (var i = 0; i < 10; ++i)
            map.set(i, 'value' + i);
        keys = map.oldestKeys();
        values = map.oldestValues();
        keys.forEach(function(key, index) {
            // Make sure we see every key once
            should(seenKeys[key]).be.undefined;
            seenKeys[key] = true;
            
            // Ensure keys and values are in the same order
            should('value' + key).be.equal(values[index]);
        });
        should(Object.keys(seenKeys).length).be.equal(i);
        
        seenKeys = {};
        keys = map.newestKeys();
        values = map.newestValues();
	    keys.forEach(function(key, index) {
            // Make sure we see every key once
            should(seenKeys[key]).be.undefined;
            seenKeys[key] = true;
            
            // Ensure keys and values are in the same order
            should('value' + key).be.equal(values[index]);
        });
        should(Object.keys(seenKeys).length).be.equal(i);

    });
    it('should create independent unrelated maps', function() {
        var map1 = new LruMap();
        var map2 = new LruMap()
        
        map1.set('a', '1');
        should(map1).be.length(1);
        should(map2).be.length(0);
        should(map2.get('a')).be.undefined;
        
        map2.set('b', '3');
        should(map1).be.length(1);
        should(map2).be.length(1);
        
        map1.set('b', '5');
        should(map1).be.length(2);
        should(map2).be.length(1);
        
        map2.set('a', '5');
        should(map1).be.length(2);
        should(map2).be.length(2);
    }); 
});
