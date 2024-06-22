import { useStateValue } from "@/providers/stateProvider";
import { useCallback, useRef } from "react";
import toast from "react-hot-toast";

export const SelectMailBox = () => {
  const { setMail, mails, mail } = useStateValue();
  const mailRef = useRef<HTMLSelectElement | null>(null);

  const fetchUserMail = useCallback(async (email: string) => {
    try {
      const data = await (
        await fetch(`${import.meta.env.VITE_BASE_API ?? ""}/api/mail/${email}`)
      ).json();

      return data;
    } catch (error) {
      console.log(error);
    }
  }, []);

  async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mailRef.current?.value) return;

    toast("Fetching user emails");

    const email = mailRef.current.value;
    const mails = await fetchUserMail(email);

    setMail({ mails, email });
  }

  return (
    <form className="w-full flex space-x-5" onSubmit={submitHandler}>
      <select ref={mailRef} className="flex-1 p-2">
        {!mail.email && (
          <>
            <option value={""}>Select Account</option>
          </>
        )}
        {mails?.map(
          (mail, index) =>
            mail?.email && (
              <option value={mail?.email} key={index}>
                {mail.firstName} {mail.lastName} {mail?.email}
              </option>
            )
        )}
      </select>
      <button
        type="submit"
        className="w-20 px-4 py-1 text-lg rounded-lg bg-red-400"
      >
        Fetch
      </button>
    </form>
  );
};
