import { MailContainer } from "./mailContainer";
import { SelectMailBox } from "./selectMailBox";
import { WriteMail } from "./writeMail";

export const MailBox = () => {
  return (
    <div className="w-full border min-h-screen flex flex-col space-y-5 flex-1 p-5">
      <SelectMailBox />
      <WriteMail />
      <MailContainer />
    </div>
  );
};
