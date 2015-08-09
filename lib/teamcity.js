var http = require('http');
var fs = require('fs');
var queryString = require('querystring');
var path = require('path');
var _ = require('underscore');
var xml2obj = require('./xml2obj').xml2obj;

function TeamCityPub(hostname, port, request){
    this.hostname = hostname || 'localhost';
    this.port = port || 8111;
    
    this.request = request || function(tc, path, next) {
        var req = http.request({
            hostname: tc.hostname,
            port: tc.port,
            path: path,
            method: 'GET',
            auth: 'guest:',
        }, function(res){
            var bufTotal = [];
            res.on('data', function(buf){
                bufTotal.push(buf);
            });
            res.on('end', function(){
                next(null, Buffer.concat(bufTotal));
            });
        }).on('error', next);
        req.end();
    };
}

//TeamCityPub.prototype.request = 
function request(tc, from_path, _query, next){
    //console.log('request(', from_path, ',', query, ')');
    var query = queryString.stringify(_query);
    if (query.length){
        from_path = from_path + '?' + query;
    }
    tc.request(tc, from_path, next);
}

function request_xml(tc, from_path, query, next){
    //console.log('request_xml(', from_path, ',', query, ')');
    request(tc, from_path, query, function(e, buf){
        if (e){
            next(e);
            return;
        }
        var xml = buf.toString();
        if (xml.length === 0){
            next('no data');
            return;
        }
        var obj = xml2obj(xml);
        console.log('request_xml', obj);
        next(null, obj, xml);
    });
}

function request_download(tc, from_path, local_path, next){
    //console.log('request_download(', from_path, ',', query, ')');
    request(tc, from_path, {}, function(e, buf){
        if (e){
            next(e);
            return;
        }
        var dir = path.dirname(local_path);
        fs.exists(dir, function(exists){
            if (!exists){
                fs.mkdir(dir, function(err){
                    if (err){
                        next(err);
                        return;
                    }
                    fs.writeFile(local_path, buf, next);
                });
            }else{
                fs.writeFile(local_path, buf, next);
            }
        });
    });
}

function download(tc, from_path, local_path, name, next){
    //console.log('download(', from_path, ',', name, ')');
    //var local_path = __dirname + '/temp/' + name;
    request_download(tc, from_path, local_path, function(err){
        if (err) {
            next(err);
        } else {
            next(null, local_path);
        }
    });
}

function build_artifacts(tc, buildid, next){
    //console.log('build_artifacts(', buildid, ')');
    request_xml(tc, '/app/rest/builds/id:' + buildid + '/artifacts/children', {}, function(e, obj, xml){
        if (e){
            //console.error(e);
            next(e);
            return;
        }
        
        next(null, obj, xml);
    });
}

function build_detail(tc, buildid, next){
    //console.log('build_detail(', buildid, ')');
    request_xml(tc, '/app/rest/builds/id:' + buildid, {}, function(e, obj, xml){
        if (e){
            //console.error(e);
            next(e);
            return;
        }
        
        next(null, obj, xml);
    });
}

function list_builds(tc, configuration, branch, next){
    //console.log('list(', buildid, ')');
    var locators = ['status:SUCCESS'];
    if (branch){
        locators.push('branch:name:' + branch);
    }
    request_xml(tc, '/app/rest/buildTypes/id:' + configuration + '/builds', {
        locator: locators.join(',')
    }, function(e, obj, xml){
        console.log('list', e, obj, xml);
        if (e){
            console.error(e);
            next(e);
            return;
        }
        if (obj.builds.build.length > 1){
            next(null, obj.builds.build);
        } else {
            next(null, [obj.builds.build]);
        }
    });
}

function list_branches(tc, configuration, next){
    request_xml(tc, '/app/rest/buildTypes/id:' + configuration + '/branches', {}, function(err, obj){
        if (err){
            next(err);
            return;
        }
        next(null, obj.branches.branch);
    });
}

var wrap_promise = require('./promise-wrap').wrap_promise;
var download_promise = wrap_promise(download);
var build_artifacts_promise = wrap_promise(build_artifacts);
var build_detail_promise = wrap_promise(build_detail);
var list_builds_promise = wrap_promise(list_builds);
var list_branches_promise = wrap_promise(list_branches);

// list builds in configuration
TeamCityPub.prototype.list_builds = function (configuration, branch) {
    return list_builds_promise(this, configuration, branch);
};

// get a list of branches in configuration
TeamCityPub.prototype.list_branches = function (configuration) {
    return list_branches_promise(this, configuration);
};

// download 
TeamCityPub.prototype.download = function (from_path, local_path, name) {
    return download_promise(this, from_path, local_path, name);
};

TeamCityPub.prototype.build_artifacts = function (buildid) {
    return build_artifacts_promise(this, buildid);
};

TeamCityPub.prototype.build_detail = function (buildid) {
    return build_detail_promise(this, buildid);
};

exports.TeamCityPub = TeamCityPub;
