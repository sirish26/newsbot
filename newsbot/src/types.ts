export type Msg = {
  id: string;
  sender: "user" | "bot";
  text: string;
};
