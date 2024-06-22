/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

type Mail = {
  email: string;
  firstName: string;
  lastName: string;
};

type MailAccount = {
  email: string;
  mails: any[];
};

const StateContext = createContext<{
  mails: Mail[];
  mail: MailAccount;
  setMail: Dispatch<SetStateAction<MailAccount>>;
}>({
  mails: [],
  mail: { email: "", mails: [] },
  setMail: (_state) => {},
});

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mails, setMails] = useState<[]>([]);
  const [mail, setMail] = useState<MailAccount>({
    email: "",
    mails: [],
  });

  const updateMessages = () =>
    setInterval(async () => {
      try {
        const newMailsResponse = await fetch(
          `${import.meta.env.VITE_BASE_API ?? ""}/api/mail/update`
        );

        const newMails = await newMailsResponse.json();

        if (newMails?.length) {
          for (const mail of newMails) {
            if (mail.messages?.length) toast(`${mail.email} got new message`);
          }
        }

        await fetch(`${import.meta.env.VITE_BASE_API ?? ""}/api/mail`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.log(error);
      }
    }, 30000);

  useEffect(() => {
    updateMessages();
  }, []);

  const fetchUserMails = useCallback(async () => {
    try {
      const data = await (
        await fetch(`${import.meta.env.VITE_BASE_API ?? ""}/api/mail`)
      ).json();
      setMails(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchUserMails();
  }, [fetchUserMails]);

  return (
    <StateContext.Provider
      value={{
        mails,
        mail,
        setMail,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateValue = () => useContext(StateContext);
