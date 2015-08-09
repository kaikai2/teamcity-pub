require('v8-promise');

function wrap_promise(f){
    return function(){
        var context = this;
        var a = Array.prototype.slice.call(arguments);
        return new Promise(function(fulfill, reject){
            a.push(function(e, obj){
                if (e){
                    reject(e);
                    return;
                }
                fulfill(obj);
            });
            f.apply(context, a);
        });
    };
}

exports.wrap_promise = wrap_promise;
