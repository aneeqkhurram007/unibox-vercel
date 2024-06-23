import { ImapFlow } from "imapflow";
import { createTransport } from "nodemailer";

const DEFAULTS = {
  imap: {
    host: "hwsrv-1223902.hostwindsdns.com",
    port: 993,
    proxy: "http://rybkxqth:wshze149gw3z@185.199.228.220:7300/",
    maxTimeout: 60000,
  },
  smtp: {
    host: "hwsrv-1223902.hostwindsdns.com",
    port: 465,
    proxy: "http://vfdwsyxl:ab6ezjy7qqbg@45.155.68.129:8133/",
    maxTimeout: 60000,
  },
};

export const getSMTPClient = ({
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

export const getImapClient = ({
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
