// CameraParts.model.js
import mongoose from "mongoose";

const CameraPartsSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    code: { // This field is required
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    partsPerCamera: {
        type: Number,
        default: 1
    },
    category: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "category"
        }
    ]
}, {
    timestamps: true
});

const CameraPartsModel = mongoose.model('CameraParts', CameraPartsSchema);

export default CameraPartsModel;
