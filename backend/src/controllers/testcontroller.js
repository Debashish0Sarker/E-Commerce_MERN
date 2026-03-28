import TestModel from "../models/testmodel.js";

export function testController(req, res) {
    res.send("Hello World from test controller");
}
export function testController2(req, res) {
    res.send("Hello World from test controller 2");
}

export async function createTest(req, res) {
    try {
        const { name, age, email } = req.body;
        const newTest = new TestModel({ name, age, email });
        await newTest.save();
        res.status(201).json(newTest);
    } catch (error) {
        res.status(500).json({ error: "Failed to create test" });
    }
}