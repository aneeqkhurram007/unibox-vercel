import { send, get, getById } from "@/controllers/mail";
import { Router } from "express";

const mailRouter = Router();

mailRouter.route("/mail").get(get).post(send);
mailRouter.route("/mail/:email").get(getById);

export default mailRouter;
