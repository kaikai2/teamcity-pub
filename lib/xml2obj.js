var sax = require('sax');

function xml2obj(xml) {
    var parser = sax.parser(true);
    //console.log('xml2obj', xml);
    
    parser.onerror = function(e){
        console.log(xml);
        console.log(e);
    };
    var stack = [{}];
    var cur = {
        name: undefined,
        value: undefined,
        isArray: false,
    };
    
    parser.ontext = function(t) {
        //console.log('ontext', t);
    };

    parser.onopentag = function(node) {
        //console.log('onopentag', node, node.attributes);
        var parent = stack.pop();
        stack.push(parent);
        if (node.name in parent) {
            if (parent[node.name] instanceof Array){
                parent[node.name].push(node.attributes);
            } else {
                parent[node.name] = [parent[node.name], node.attributes];
            }
        } else {
            parent[node.name] = node.attributes;
        }
        stack.push(node.attributes);
    };
    parser.onclosetag = function() {
        //console.log('onclosetag');
        stack.pop();
    };
    parser.onattribute = function (attr) {
        //cur.value[attr.name] = attr.value;
    };

    parser.onend = function() {

        //console.log('onend');
    };
    parser.write(xml).close();
    
    //console.log('end of: xml2obj', xml);

    //console.log(stack[0]);
    return stack[0];
}

exports.xml2obj = xml2obj;
