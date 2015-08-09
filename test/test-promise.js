var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-spies'));
chai.use(require("chai-as-promised"));


describe('teamcity-pub', function() {
    describe('#promise', function() {

        var wrap_promise = require('../lib/promise-wrap').wrap_promise;

        function async_func(next) {
           // return;
            setTimeout(function(){
                next(null, 1);
            }, 0);
        }
        var promised_func = wrap_promise(async_func);

        it('should firstly make sure the async function will proceed the callback', function(done) {

            var spy = chai.spy();

            async_func(spy);

            setTimeout(function(){
                expect(spy).to.have.been.called.once();
                done();
            }, 1);
        });

        it('should wrap a normal async func as a promise object', function(done) {

            var spy = chai.spy();
            expect(promised_func().then(spy)).to.be.fulfilled.and.notify(function() {
                expect(spy).to.have.been.called.once();
                done();
            });
        });
    });
});
