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

  const fetchUserMails = useCallback(async () => {
    try {
      const data = await (await fetch(`/api/mail`)).json();
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
