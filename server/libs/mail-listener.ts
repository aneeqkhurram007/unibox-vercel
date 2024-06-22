import convertCsvToJson from "convert-csv-to-json";
import path from "path";
import { state } from "@/store/state";
import { getImapClient } from "./emailClients";

export const openAllConnections = async () => {
  const mails = convertCsvToJson
    .fieldDelimiter(",")
    .getJsonFromCsv(path.resolve("data", "data.csv"));

  (state as any).accounts = mails
    .filter((mail) => mail["Email"] && mail["password"])
    .slice(0, 10);

  for (const emailData of state.accounts) {
    const client = getImapClient({
      host: emailData["SMTPHost"],
      pass: emailData["password"],
      user: emailData["Email"],
      port: emailData["IMAPPort"],
    });

    try {
      await client.connect();

      console.log(`Email:${emailData["Email"]}`);

      let emailClient = (state as any).emailClients[emailData["Email"]];

      if (!emailClient)
        (state as any).emailClients[emailData["Email"]] = client;
    } catch (error) {
      console.log(error);
    }
  }
};
