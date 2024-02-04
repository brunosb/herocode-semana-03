import { useSocket } from "@/context/SocketContext";
import { Send } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface IChatMessage {
  message: string;
  username: string;
  roomId: string;
  time: string;
}

export default function Chat({ roomId }: { roomId: string }) {
  const { socket } = useSocket();
  const currentMsg = useRef<HTMLInputElement>(null);

  const [chat, setChat] = useState<IChatMessage[]>([]);

  function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (currentMsg.current && currentMsg.current?.value !== "") {
      const sendMsgToServer: IChatMessage = {
        message: currentMsg.current.value,
        username: "Bruno Barbosa",
        roomId: roomId,
        time: new Date().toLocaleTimeString(),
      };

      socket?.emit("chat", sendMsgToServer);
      setChat((prev) => [...prev, sendMsgToServer]);

      currentMsg.current.value = "";
    }
  }

  useEffect(() => {
    socket?.on("chat", (data) => {
      console.log("message " + data);
      setChat((prev) => [...prev, data]);
    });
  }, [socket]);

  return (
    <div className="bg-gray-900 px-4 pt-4 md:w-[20%] hidden md:flex rounded-md m-3 h-full">
      <div className="relative h-full w-full">
        {chat.map((chat, index) => (
          <div className="bg-gray-950 rounded p-2 mb-4" key={index}>
            <div className="flex items-center text-blue-400 space-x-2">
              <span>{chat.username}</span>
              <span>{chat.time}</span>
            </div>
            <div className="mt-5 text-sm">
              <span>{chat.message}</span>
            </div>
          </div>
        ))}

        <form className="absolute bottom-2 w-full" onSubmit={sendMessage}>
          <div className="flex relative">
            <input
              type="text"
              name=""
              id=""
              ref={currentMsg}
              className="px-3 py-2 mb-2 bg-gray-950 rounded-md w-full"
            />
            <button type="submit">
              <Send className="h-5 w-5 absolute right-2 top-2.5 text-white bg-gray-950 cursor-pointer" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
