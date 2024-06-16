import { useStateValue } from "@/providers/stateProvider";
import { useState } from "react";

export const MailContainer = () => {
  const {
    mail: { mails },
  } = useStateValue();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [message, setMessage] = useState<any>();

  return (
    <div className="flex-1 min-h-96 flex flex-col space-y-5">
      <h1 className="text-center text-lg ">Received Emails</h1>
      <div className="border h-full flex-1 grid grid-cols-12">
        <div className="border col-span-3 overflow-y-auto">
          <ul className="p-1">
            {mails?.map((mail, index) => (
              <li
                onClick={() => setMessage(mail)}
                className="bg-gray-100 border hover:bg-gray-300 cursor-pointer my-1"
                key={index}
              >
                {mail?.envelope?.subject}
              </li>
            ))}
          </ul>
        </div>
        <div className="border col-span-9 p-1 overflow-y-auto">
          {message && (
            <div>
              <p>From: {message.envelope.from[0].address}</p>
              <p>Date: {new Date(message.envelope.date).toUTCString()}</p>
              <p>Subject: {message.envelope.subject}</p>
              <p>Body:</p>
              <div
                dangerouslySetInnerHTML={{
                  __html: message?.mail?.html,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
