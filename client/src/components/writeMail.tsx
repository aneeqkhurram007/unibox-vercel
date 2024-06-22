import { useStateValue } from "@/providers/stateProvider";
import { useRef } from "react";
import toast from "react-hot-toast";

export const WriteMail = () => {
  const {
    mail: { email },
  } = useStateValue();

  const toRef = useRef<HTMLInputElement | null>(null);
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const [to, subject, body] = [
        toRef.current?.value,
        subjectRef.current?.value,
        bodyRef.current?.value,
      ];

      if (!to || !subject || !body?.trim()) {
        toast.error(
          "Make sure to have a receiver address, subject and a body with valid values"
        );
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API ?? ""}/api/mail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to, from: email, subject, body }),
        }
      );

      if (response.ok) toast("Message sent successfully");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    email && (
      <form className="flex flex-col space-y-5" onSubmit={submitHandler}>
        <h1 className="text-center text-lg">Send Email</h1>
        <div className="flex flex-col space-y-3">
          <label>To:</label>
          <input
            ref={toRef}
            required
            className="border rounded-md p-3"
            type="email"
          />
        </div>

        <div className="flex flex-col space-y-3">
          <label>From:</label>
          <input
            className="border rounded-md p-3"
            disabled
            type="email"
            value={email}
          />
        </div>

        <div className="flex flex-col space-y-3">
          <label>Subject:</label>
          <input
            ref={subjectRef}
            className="border rounded-md p-3"
            type="text"
          />
        </div>

        <div className="flex flex-col space-y-3">
          <label>Body:</label>
          <textarea rows={7} ref={bodyRef} className="border rounded-md p-3" />
        </div>

        <div>
          <button className="px-4 py-1 bg-green-400 rounded-md" type="submit">
            Send
          </button>
        </div>
      </form>
    )
  );
};
