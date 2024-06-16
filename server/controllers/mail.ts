import { Request, Response } from "express";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { createTransport } from "nodemailer";
import convertCsvToJson from "convert-csv-to-json";
import path from "path";

const DEFAULTS = {
  imap: {
    host: "hwsrv-1223902.hostwindsdns.com",
    port: 993,
    proxy: "http://vfdwsyxl:ab6ezjy7qqbg@45.94.47.66:8110/",
    maxTimeout: 60000,
  },
  smtp: {
    host: "hwsrv-1223902.hostwindsdns.com",
    port: 465,
    proxy: "http://vfdwsyxl:ab6ezjy7qqbg@45.94.47.66:8110/",
    maxTimeout: 60000,
  },
};

const getSMTPClient = ({
  host,
  port,
  user,
  pass,
}: {
  host: string;
  port: number;
  user: string;
  pass: string;
}) =>
  createTransport({
    host: host || DEFAULTS.smtp.host,
    port: port || DEFAULTS.smtp.port,
    secure: true,
    auth: {
      user,
      pass,
    },
    dnsTimeout: DEFAULTS.smtp.maxTimeout,
    socketTimeout: DEFAULTS.smtp.maxTimeout,
    greetingTimeout: DEFAULTS.smtp.maxTimeout,
    connectionTimeout: DEFAULTS.smtp.maxTimeout,
  });

const getImapClient = ({
  host,
  port,
  user,
  pass,
}: {
  host: string;
  port: number;
  user: string;
  pass: string;
}) =>
  new ImapFlow({
    host: host || DEFAULTS.imap.host,
    port: port || DEFAULTS.imap.port,
    secure: true,
    auth: {
      user,
      pass,
    },
    proxy: DEFAULTS.imap.proxy,
    tls: {
      rejectUnauthorized: false,
    },
    greetingTimeout: DEFAULTS.imap.maxTimeout,
    connectionTimeout: DEFAULTS.imap.maxTimeout,
    socketTimeout: DEFAULTS.imap.maxTimeout,
    maxIdleTime: DEFAULTS.imap.maxTimeout,
  });

export const getById = async (request: Request, response: Response) => {
  try {
    const email = request.params.email;

    const emailData = convertCsvToJson
      .fieldDelimiter(",")
      .getJsonFromCsv(path.resolve("data", "data.csv"))
      .find((item) => item["Email"] === email);

    if (!emailData) throw new Error("Email does not exist");

    const client = getImapClient({
      host: emailData["SMTPHost"],
      pass: emailData["password"],
      user: emailData["Email"],
      port: emailData["IMAPPort"],
    });

    await client.connect();

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
    } finally {
      lock.release();
      await client.logout();
      return response.json(messages);
    }
  } catch (error) {
    console.error("Client Error: ", error);
    return response.json([]);
  }
};

export const get = async (request: Request, response: Response) => {
  try {
    const emailData = convertCsvToJson
      .fieldDelimiter(",")
      .getJsonFromCsv(path.resolve("data", "data.csv"));
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

    const emailData = convertCsvToJson
      .fieldDelimiter(",")
      .getJsonFromCsv(path.resolve("data", "data.csv"))
      .find((item) => item["Email"] === from);

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
