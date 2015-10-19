var should = require('should'),
    LruMap = require('../lrumap.js');

describe('lrumap', function() {
    it('should construct with no arguments', function() {
        var map = new LruMap();
        should(map).be.instanceOf(LruMap);
        should(map.set).be.Function();
    });
    it('should have the documented interface', function() {
        var map = new LruMap();
        should(map.length).be.equal(0);
        should(map.set).be.instanceOf(Function);
        should(map.get).be.instanceOf(Function);
        should(map.has).be.instanceOf(Function);
        should(map.newestKey).be.instanceOf(Function);
        should(map.oldestKey).be.instanceOf(Function);
        should(map.someNewest).be.instanceOf(Function);
        should(map.someOldest).be.instanceOf(Function);
        should(map.oldestValue).be.instanceOf(Function);
        should(map.newestValue).be.instanceOf(Function);
        should(map.delOldestUntil).be.instanceOf(Function);
        should(map.delNewestUntil).be.instanceOf(Function);
    });
    it('should store and retrieve values', function() {
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
    it('should insert 10k items fast', function() {
        var map = new LruMap();
        for (var i = 0; i < 10000; ++i)
            map.set(i, 'value' + i);
    });
});