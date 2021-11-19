const mongoose = require('mongoose');

module.exports.schema2json = function (schema) {
    let _schema = {obj: schema.obj, _userProvidedOptions: schema._userProvidedOptions, _indexes: schema._indexes}
    return JSON.stringify(_schema, function (key, value) {
        if (value instanceof RegExp) {
            return ('__REGEXP ' + value.toString());
        } else if (value instanceof mongoose.Schema) {
            return 'mongoose.Schema:' + module.exports.schema2json(value);
        } else if (typeof value === 'function') {
            if (key === 'validator') return value.toString();
            return value.name;
        }
        return value;
    })
}

module.exports.json2schema = function (json) {
    const parsed = schemaJsonParse(json);
    let schema = new mongoose.Schema(parsed.obj, parsed._userProvidedOptions)
    parsed._indexes.map(item => schema.index(item[0], item[1]));
    return schema;
}


function schemaJsonParse(json) {
    return JSON.parse(json, function (key, value) {
        if (typeof value === 'string' && value.startsWith('mongoose.Schema:')) {
            let _v = value.substring(16);
            try {
                let _o = schemaJsonParse(_v);
                if (_o) return module.exports.json2schema(_v);
            } catch (e) {
            }
        }
        if (global.hasOwnProperty(value)) {
            return global[value];
        } else if (mongoose.Schema.Types.hasOwnProperty(value)) {
            return mongoose.Schema.Types[value];
        } else if (key === 'validator') {
            return (new Function('return( ' + value + ' );'))();
        }
        if (value && value.toString && value.toString().startsWith('__REGEXP ')) {
            let m = value.split('__REGEXP ')[1].match(/\/(.*)\/(.*)?/);
            return new RegExp(m[1], m[2] || '');
        }
        return value;
    })
}