import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    age:{ type: Number, required: true },
    email:{ type: String, required: true },
},
    {timestamps:true}
);

const TestModel = mongoose.model("Test", testSchema);
export default TestModel;