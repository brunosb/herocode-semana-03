"use client";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useSocket } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface IAnswer {
  sender: string;
  description: RTCSessionDescription;
}

interface ICandidate {
  sender: string;
  candidate: RTCIceCandidate;
}

interface IDataStream {
  id: string;
  stream: MediaStream;
}

export default function Room({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { socket } = useSocket();
  const localStream = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});

  const [videoMidiaStream, setVideoMidiaStream] = useState<MediaStream | null>(
    null
  );
  const [remoteStreams, setRemoteStreams] = useState<IDataStream[]>([]);
  console.log("remoteStream", remoteStreams);

  useEffect(() => {
    socket?.on("connect", async () => {
      console.log("Connected to server");
      socket.emit("subscribe", {
        roomId: params.id,
        socketId: socket.id,
      });
      await initLocalCamera();
    });

    socket?.on("new user", (data) => {
      console.log("Usuario novo conectado", data);
      createPeerConnection(data.socketId, false);
      socket.emit("newUserStart", { to: data.socketId, sender: socket.id });
    });

    socket?.on("newUserStart", (data) => {
      console.log("Novo usuário conectado na sala", data);
      createPeerConnection(data.sender, true);
    });

    socket?.on("sdp", async (data) => handleAnswer(data));

    socket?.on("ice candidates", async (data) => handleIceCandidate(data));
  }, [socket]);

  const handleIceCandidate = async (data: ICandidate) => {
    if (data.candidate) {
      const peerConnection = peerConnections.current[data.sender];
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const handleAnswer = async (data: IAnswer) => {
    const peerConnection = peerConnections.current[data.sender];
    if (data.description.type === "offer") {
      await peerConnection.setRemoteDescription(data.description);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log("Criando uma resposta para o usuário");

      socket?.emit("sdp", {
        to: data.sender,
        sender: socket?.id,
        description: peerConnection.localDescription,
      });
    } else if (data.description.type === "answer") {
      console.log("Recebendo uma resposta do usuário");
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.description)
      );
    }
  };

  const createPeerConnection = async (
    socketId: string,
    createOffer: boolean
  ) => {
    const config: RTCConfiguration = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };

    const peer = new RTCPeerConnection(config);
    peerConnections.current[socketId] = peer;
    const peerConnection = peerConnections.current[socketId];

    if (videoMidiaStream) {
      videoMidiaStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, videoMidiaStream);
      });
    } else {
      const video = await initRemoteCamera();
      video.getTracks().forEach((track) => {
        peerConnection.addTrack(track, video);
      });
    }

    if (createOffer) {
      const peerConnection = peerConnections.current[socketId];
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log("Criando uma oferta para o usuário");

      socket?.emit("sdp", {
        to: socketId,
        sender: socket?.id,
        description: peerConnection.localDescription,
      });
    }

    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];

      const dataStream: IDataStream = {
        id: socketId,
        stream: remoteStream,
      };

      setRemoteStreams((prev: IDataStream[]) => {
        if (prev.find((stream) => stream.id === socketId)) {
          return prev;
        }
        return [...prev, dataStream];
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("ice candidates", {
          to: socketId,
          sender: socket?.id,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.onsignalingstatechange = (event) => {
      switch (peerConnection.signalingState) {
        case "closed":
          setRemoteStreams((prev) =>
            prev.filter((stream) => stream.id !== socketId)
          );
          break;
      }
    };

    peerConnection.onconnectionstatechange = (event) => {
      switch (peerConnection.connectionState) {
        case "disconnected":
          setRemoteStreams((prev) =>
            prev.filter((stream) => stream.id !== socketId)
          );
          break;
        case "failed":
          setRemoteStreams((prev) =>
            prev.filter((stream) => stream.id !== socketId)
          );
          break;
        case "closed":
          setRemoteStreams((prev) =>
            prev.filter((stream) => stream.id !== socketId)
          );
          break;
      }
    };
  };

  const initLocalCamera = async () => {
    const video = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    setVideoMidiaStream(video);

    if (localStream.current) {
      localStream.current.srcObject = video;
    }
  };

  const initRemoteCamera = async () => {
    const video = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    return video;
  };

  const logout = () => {
    videoMidiaStream?.getTracks().forEach((track) => {
      track.stop();
    });

    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.close();
    });

    socket?.disconnect();
    router.push("/");
  };

  return (
    <div className="h-screen">
      <Header />
      <div className="flex h-[80%]">
        <div className="md:w-[80%] w-full m-3">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
            <div className="bg-gray-950 w-full rounded-md h-full p-2 relative">
              <video
                className="h-full w-full mirror-mode"
                autoPlay
                ref={localStream}
              ></video>
              <span className="absolute bottom-3">Bruno Barbosa</span>
            </div>
            {remoteStreams.map((stream, index) => (
              <div
                className="bg-gray-950 w-full rounded-md h-full p-2 relative"
                key={index}
              >
                <video
                  className="h-full w-full"
                  autoPlay
                  ref={(video) => {
                    if (video && video.srcObject !== stream.stream) {
                      video.srcObject = stream.stream;
                    }
                  }}
                ></video>
                <span className="absolute bottom-3">Bruno Barbosa</span>
              </div>
            ))}
          </div>
        </div>
        <Chat roomId={params.id} />
      </div>
      <Footer
        videoMediaStream={videoMidiaStream}
        peerConnections={peerConnections}
        localStream={localStream}
        logout={logout}
      />
    </div>
  );
}
