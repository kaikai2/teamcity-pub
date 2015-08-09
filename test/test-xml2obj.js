var expect = require('chai').expect,
    xml2obj = require('../lib/xml2obj').xml2obj;

describe('teamcity-pub', function() {
    describe('#xml2obj', function() {
        it('should convert xml to obj', function() {
            var xml = "<a><b></b></a>";
            var obj = xml2obj(xml);
            console.log(obj);
            expect(obj).to.have.property('a');
        });

    });
});