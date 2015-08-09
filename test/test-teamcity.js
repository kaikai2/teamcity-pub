/*jshint expr: true*/
var chai = require('chai'),
    sinon = require('sinon');

//chai.use(require('chai-spies'));
chai.use(require("chai-as-promised"));

teamcity = require('../lib/teamcity');


describe('teamcity-pub', function() {
    
    var expect = chai.expect;
    
    describe('#teamcity.list', function() {
        it('should list ', function(done) {

            var stub = sinon.stub();

            var pub = new teamcity.TeamCityPub('test', 8111, stub);
            var configurationName = 'config-build1';
            stub.withArgs(sinon.match.any, sinon.match(configurationName), sinon.match.any)
                .callsArgWithAsync(2, null, "<builds><build></build></builds>");

            var spy = sinon.spy();
            expect(pub.list_builds(configurationName).then(spy)).to.be.fulfilled.and.notify(function(){
                expect(spy.calledOnce).to.be.true;
                console.log('notified in expect');
                console.log(stub.getCall(0).args[1]);
                expect(stub.getCall(0).args[1]).to.contain(configurationName);
                done();
            });
        });
    });

});
