/*
 * The MIT License (MIT). See LICENCE file for more information
 * Copyright (c) 2015 Doug Gale
 */

"use strict"

var should = require('should'),
    LruMap = require('../lrumap.js');

describe('lrumap', function() {
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
        should(map.set).be.instanceOf(Function);
        should(map.get).be.instanceOf(Function);
        should(map.del).be.instanceOf(Function);
        should(map.has).be.instanceOf(Function);
        should(map.newestKey).be.instanceOf(Function);
        should(map.oldestKey).be.instanceOf(Function);
        should(map.someNewest).be.instanceOf(Function);
        should(map.someOldest).be.instanceOf(Function);
        should(map.oldestValue).be.instanceOf(Function);
        should(map.newestValue).be.instanceOf(Function);
        should(map.delOldestWhile).be.instanceOf(Function);
        should(map.delNewestWhile).be.instanceOf(Function);
    });
    it('should store and retrieve data', function() {
        var map = new LruMap();
        should(map.length).be.equal(0);
        should(map.has('a')).be.equal(false);
        should(map.get('a')).be.equal(undefined);
        should(map.newestKey()).be.equal(undefined);
        should(map.oldestKey()).be.equal(undefined);
        should(map.newestValue()).be.equal(undefined);
        should(map.oldestValue()).be.equal(undefined);

        should(map.set('a', 1)).be.equal(false);

        should(map.length).be.equal(1);
        should(map.has('a')).be.equal(true);
        should(map.get('a')).be.equal(1);
        should(map.newestKey()).be.equal('a');
        should(map.oldestKey()).be.equal('a');
        should(map.newestValue()).be.equal(1);
        should(map.oldestValue()).be.equal(1);
   
        should(map.set('a', 1)).be.equal(true);

        should(map.length).be.equal(1);
        should(map.has('a')).be.equal(true);
        should(map.get('a')).be.equal(1);
        should(map.newestKey()).be.equal('a');
        should(map.oldestKey()).be.equal('a');
        should(map.newestValue()).be.equal(1);
        should(map.oldestValue()).be.equal(1);
        
        should(map.set('b', 2)).be.equal(false);

        should(map.length).be.equal(2);
        should(map.has('a')).be.equal(true);
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
        should(map.get('true')).be.equal(true);
        should(map.get('false')).be.equal(false);
        should(map.get('null')).be.equal(null);
        should(map.get('NaN')).be.NaN;
        should(map.get('array')).be.equal(arr);
        should(map.get('undefined')).be.equal(undefined);
    });
    it('should not initially have any keys from Object', function () {
        var map = new LruMap(),
            key;
        Object.getOwnPropertyNames(Object.getPrototypeOf({}))
        .forEach(function(key) {
            should(map.has(key)).be.equal(false);
            should(map.get(key)).be.equal(undefined);
        });
    });
    it('should remove keys properly', function () {
        var map = new LruMap();
        should(map.has('1')).be.equal(false);
        should(map.length).be.equal(0);
        should(map.set('1', 'a')).be.equal(false);
        should(map.length).be.equal(1);
        should(map.has('1')).be.equal(true);
        should(map.del('1')).be.equal(true);
        should(map.oldestValue()).be.equal(undefined);
        should(map.has('1')).be.equal(false);
        should(map.del('1')).be.equal(false);
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
        
        should(map.has('0')).be.equal(false);
        should(map.has('1')).be.equal(false);
        should(map.has('2')).be.equal(true);
        should(map.has('3')).be.equal(true);
        should(map.has('4')).be.equal(true);

        should(map.oldestKey()).be.equal('2');
        should(map.oldestValue()).be.equal('value_2');

        should(map.newestKey()).be.equal('4');
        should(map.newestValue()).be.equal('value_4');
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
    it('should provide basic iteration facilities', function() {
        var map = new LruMap(),
            rep,
            track, 
            thisArg, 
            oldestFirstKey, 
            newestFirstKey;
        
        for (var i = 1; i <= 10; ++i)
            map.set(i, 'value' + i);
        
        thisArg = { passed: 42 };
        should(map.someOldest(function(value, key, passedMap) {
            should(key).be.instanceOf(String);
            if (oldestFirstKey === undefined)
                oldestFirstKey = key;
            should(this).be.equal(thisArg);
            should(this.passed).be.equal(42);
            should(passedMap).be.equal(map);
            should(+key).be.within(1, 10);
            should(value).be.equal('value' + key);
        }, thisArg)).be.equal(false);
        should(oldestFirstKey).be.equal('1')
        should(map.someNewest(function(value, key, passedMap) {
            should(key).be.instanceOf(String);
            if (newestFirstKey === undefined)
                newestFirstKey = key;
            should(this).be.equal(thisArg);
            should(this.passed).be.equal(42);
            should(passedMap).be.equal(map);
            should(+key).be.within(1, 10);
            should(value).be.equal('value' + key);
        }, thisArg)).be.equal(false);
        should(newestFirstKey).be.equal('10')
    });
    it('should do ordered iterations in the correct order', function() {
        var map = new LruMap(), rep, track;
        for (var i = 0; i < 10; ++i)
            map.set(i, 'value' + i);
        track = 0;
        should(map.someOldest(function(value, key, passedMap) {
            should(value).be.equal('value' + track);
            should(key).be.equal((track++).toString());
        })).be.equal(false);
        should(track).be.equal(10);
        should(map.someNewest(function(value, key, passedMap) {
            should(key).be.equal((--track).toString());
            should(value).be.equal('value' + track);
        })).be.equal(false);
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
        })).be.equal(true);
        should(track).be.equal(true);
        
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
        })).be.equal(true);
        should(track).be.equal(true);
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
        })).be.equal(true);
        should(track).be.equal(true);
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
            should(seenKeys[key]).be.equal(undefined);
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
            should(seenKeys[key]).be.equal(undefined);
            seenKeys[key] = true;
            
            // Ensure keys and values are in the same order
            should('value' + key).be.equal(values[index]);
        });
        should(Object.keys(seenKeys).length).be.equal(i);

    });
});
