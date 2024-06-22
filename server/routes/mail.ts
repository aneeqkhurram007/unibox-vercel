import {
  send,
  get,
  getById,
  updateMails,
  getState,
  seenMessage,
  seenAllMessages,
} from "@/controllers/mail";
import { Router } from "express";

const mailRouter = Router();

mailRouter.route("/mail/update").get(updateMails);
mailRouter.route("/mail/:email").get(getById).patch(seenMessage);
mailRouter.route("/mail").get(get).post(send).patch(seenAllMessages);
mailRouter.route("/state").get(getState);

// Add messages to seen

export default mailRouter;
