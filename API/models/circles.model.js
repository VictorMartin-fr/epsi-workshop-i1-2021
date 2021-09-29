module.exports = mongoose => {
    var schema =
        mongoose.Schema({
            name: String,
            members: [String],
            messages:[{author: String,content: String, posted_at: String, seenby: [String]}],
            owner: String,
            settings: {msgDeletionTime: Number, color: String},
            isDirect: Boolean
        }, {
            timestamps: true
        });

        schema.method("toJSON", function() {
            const { __v, _id, ...object } = this.toObject();
            object.id = _id;
            return object;
        });

        const Circle = mongoose.model("circle", schema);

    return Circle;
};