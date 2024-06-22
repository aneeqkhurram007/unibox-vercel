import { Request, Response } from "express";
import { simpleParser } from "mailparser";
import { state } from "@/store/state";
import { getImapClient, getSMTPClient } from "@/libs/emailClients";
import { ImapFlow } from "imapflow";

export const get = async (request: Request, response: Response) => {
  try {
    const emailData = state.accounts;

    return response.json(
      emailData?.map((mail) => ({
        email: mail["Email"],
        firstName: mail["FirstName"],
        lastName: mail["LastName"],
      }))
    );
  } catch (error) {
    console.log(error);
    return response.json([]);
  }
};

export const send = async (request: Request, response: Response) => {
  try {
    const { to, from, subject, body } = request.body;

    const emailData = state.accounts.find((item) => item["Email"] === from);

    if (!emailData) throw new Error("Email does not exist");

    console.log(emailData);
    const transporter = getSMTPClient({
      host: emailData["SMTPHost"],
      pass: emailData["password"],
      user: emailData["Email"],
      port: emailData["SMTPPort"],
    });

    const mail = await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
      html: body,
    });

    return response.json(mail);
  } catch (error) {
    console.log(error);
    return response.status(400).json({});
  }
};

export const getById = async (request: Request, response: Response) => {
  const email = request.params.email;
  try {
    const emailData = state.accounts.find((item) => item["Email"] === email);

    if (!emailData) throw new Error("Email does not exist");

    let client = (state as any).emailClients?.[emailData["Email"]];

    if (!client) {
      client = getImapClient({
        host: emailData["SMTPHost"],
        pass: emailData["password"],
        user: emailData["Email"],
        port: emailData["IMAPPort"],
      });

      await client.connect();

      (state as any).emailClients[emailData["Email"]] = client;

      console.log(`Client added to state in controller`);
    }

    let lock = await client.getMailboxLock("INBOX");
    const messages = [];

    try {
      for await (let message of client.fetch("1:*", {
        envelope: true,
        bodyStructure: true,
        source: true,
      })) {
        const parsedMail = await simpleParser(message.source);

        messages.push({
          id: message.uid,
          envelope: message.envelope,
          mail: parsedMail,
        });
      }
    } catch (error) {
      console.error("Message Error: ", error);
      (state as any).emailClients[emailData["Email"]] = null;
    } finally {
      lock.release();
      return response.json(messages);
    }
  } catch (error) {
    console.error("Client Error: ", error);
    (state as any).emailClients[email] = null;
    return response.json([]);
  }
};

export const updateMails = async (request: Request, response: Response) => {
  const mails = [];
  for (const email of Object.keys(state.emailClients)) {
    try {
      const emailData = (state.accounts as any).find(
        (item: any) => item["Email"] === email
      );

      let client = (state as any).emailClients?.[emailData["Email"]];

      if (!client) {
        client = getImapClient({
          host: emailData["SMTPHost"],
          pass: emailData["password"],
          user: emailData["Email"],
          port: emailData["IMAPPort"],
        });

        await client.connect();

        (state as any).emailClients[emailData["Email"]] = client;

        console.log(`Client added to state in controller`);
      }

      let lock = await client.getMailboxLock("INBOX");
      const messages = [];

      try {
        for await (let message of client.fetch(
          {
            seen: false,
          },
          {
            envelope: true,
            bodyStructure: true,
            source: true,
          }
        )) {
          messages.push({
            id: message.uid,
            envelope: message.envelope,
          });
        }
      } catch (error) {
        console.error("Message Error: ", error);
        (state as any).emailClients[emailData["Email"]] = null;
      } finally {
        lock.release();
        mails.push({
          email,
          messages,
        });
      }
    } catch (error) {
      console.error("Client Error: ", error);
      (state as any).emailClients[email] = null;
    }
  }
  return response.json(mails);
};

export const getState = (request: Request, response: Response) => {
  response.json({
    accounts: state.accounts,
    emailClients: Object.keys(state.emailClients),
  });
};

export const seenMessage = async (request: Request, response: Response) => {
  const { email } = request.params;

  try {
    const emailData = state.accounts.find((item) => item["Email"] === email);

    if (!emailData) throw new Error("Email does not exist");

    let client: ImapFlow = (state as any).emailClients?.[emailData["Email"]];

    if (!client) {
      client = getImapClient({
        host: emailData["SMTPHost"],
        pass: emailData["password"],
        user: emailData["Email"],
        port: emailData["IMAPPort"],
      });

      await client.connect();

      (state as any).emailClients[emailData["Email"]] = client;

      console.log(`Client added to state in controller`);
    }

    let lock = await client.getMailboxLock("INBOX");

    try {
      await client.messageFlagsAdd(
        {
          seen: false,
        },
        ["Seen"]
      );
    } catch (error) {
      console.error("Message Error: ", error);
      (state as any).emailClients[emailData["Email"]] = null;
    } finally {
      lock.release();
    }

    response.sendStatus(200);
  } catch (error) {
    console.error("Client Error: ", error);
    (state as any).emailClients[email] = null;
    response.sendStatus(400);
  }
};

export const seenAllMessages = async (request: Request, response: Response) => {
  const { mails } = request.body;

  for (const email of mails) {
    try {
      const emailData = state.accounts.find((item) => item["Email"] === email);

      if (!emailData) throw new Error("Email does not exist");

      let client: ImapFlow = (state as any).emailClients?.[emailData["Email"]];

      if (!client) {
        client = getImapClient({
          host: emailData["SMTPHost"],
          pass: emailData["password"],
          user: emailData["Email"],
          port: emailData["IMAPPort"],
        });

        await client.connect();

        (state as any).emailClients[emailData["Email"]] = client;

        console.log(`Client added to state in controller`);
      }

      let lock = await client.getMailboxLock("INBOX");

      try {
        await client.messageFlagsAdd(
          {
            seen: false,
          },
          ["\\Seen"]
        );
      } catch (error) {
        console.error("Message Error: ", error);
        (state as any).emailClients[emailData["Email"]] = null;
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error("Client Error: ", error);
      (state as any).emailClients[email] = null;
    }
  }
  response.sendStatus(200);
};
