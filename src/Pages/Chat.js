import { ChatEngine } from "react-chat-engine";
import "./Chat.css";
import ChatFeed from "../components/ChatFeed";

export const ChatApp = () => {
  return (
    <ChatEngine
      height="90vh"
      projectID="0af0a806-1c97-4505-9c20-9de6a928df66"
      userName="bcardtoday"
      userSecret="hereWeGo"
      renderChatFeed={(chatAppProps) => <ChatFeed {...chatAppProps} />}
    />
  );
};
