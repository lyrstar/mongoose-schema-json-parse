const mongoose = require('mongoose');

module.exports.schema2json = function (schema) {
    let _schema = {obj: schema.obj, _userProvidedOptions: schema._userProvidedOptions, _indexes: schema._indexes}
    return JSON.stringify(_schema, function (key, value) {
        if (value instanceof RegExp) {
            return ('__REGEXP ' + value.toString());
        } else if (typeof value === 'function') {
            if (key === 'validator') return value.toString();
            return value.name;
        }
        return value;
    })
}

module.exports.json2schema = function (json) {
    const parsed = JSON.parse(json, function (key, value) {
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
    let schema = new mongoose.Schema(parsed.obj, parsed._userProvidedOptions)
    parsed._indexes.map(item => schema.index(item[0], item[1]));
    return schema;
}
