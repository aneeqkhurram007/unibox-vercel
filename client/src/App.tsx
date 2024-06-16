import { MailBox } from "./components/mailBox";

function App() {
  return (
    <div className="container max-w-7xl mx-auto py-10 min-h-screen flex flex-col space-y-10">
      <h1 className="text-center text-3xl font-semibold">Uni-Box</h1>
      <MailBox />
    </div>
  );
}

export default App;
