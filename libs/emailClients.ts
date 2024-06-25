import { ImapFlow } from "imapflow";
import { createTransport } from "nodemailer";

import proxies from "@/data/proxies.json";
import { state } from "@/store/state";

const DEFAULTS = {
  imap: {
    host: "hwsrv-1223902.hostwindsdns.com",
    port: 993,
    maxTimeout: 60000,
  },
  smtp: {
    host: "hwsrv-1223902.hostwindsdns.com",
    port: 465,
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
}) => {
  return new ImapFlow({
    host: host || DEFAULTS.imap.host,
    port: port || DEFAULTS.imap.port,
    secure: true,
    auth: {
      user,
      pass,
    },
    proxy: state.currentProxy,
    tls: {
      rejectUnauthorized: false,
    },
    greetingTimeout: DEFAULTS.imap.maxTimeout,
    connectionTimeout: DEFAULTS.imap.maxTimeout,
    socketTimeout: DEFAULTS.imap.maxTimeout,
    maxIdleTime: DEFAULTS.imap.maxTimeout,
  });
};
export const getProxy = () => {
  let count = 0;

  while (true) {
    const proxyItem = proxies.at(Math.random() * 249);

    const [ip, port, username, password] = (proxyItem?.proxy as any).split(":");

    const proxy = `http://${username}:${password}@${ip}:${port}/`;

    if (proxy && !(state.usedProxies as any).includes(proxy as any)) {
      state.currentProxy = proxy;
      (state.usedProxies as any).push(proxy);
      return proxy;
    }
    if (count >= 250) {
      state.currentProxy = "http://rlfqzwrs:a3hunzoergxv@78.159.34.125:6072/";
      return "http://rlfqzwrs:a3hunzoergxv@78.159.34.125:6072/";
    }

    count++;
  }
};
