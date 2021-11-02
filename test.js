const mongoose = require('mongoose');
const {json2schema, schema2json} = require('./index');

const AccountSchema = new mongoose.Schema({
    uid: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    nickname: String,
    sex: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    others: {}
}, {timestamps: true});
AccountSchema.index({'others.score': 1}, {unique: true, sparse: true});
AccountSchema.index({'others.level': 1}, {unique: true, sparse: true});


let json1 = schema2json(AccountSchema)
console.log(json1)
let schema = json2schema(json1)
let json2 = schema2json(schema)
console.log(json2)
console.log(json1 === json2)
