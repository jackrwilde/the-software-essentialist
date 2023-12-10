import express, { json } from "express";
import { createUser, editUser, getUserByEmail } from "./controllers/userController";

const port = process.env.PORT || 3000;

const app = express();
app.use(json());

app.post("/users/new", createUser);
app.post("/users/edit/:userId", editUser)
app.get("/users", getUserByEmail);

app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});
