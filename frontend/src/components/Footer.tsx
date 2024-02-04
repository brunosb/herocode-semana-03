"use client";
import {
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  Video,
  VideoOff,
} from "lucide-react";
import Container from "./Container";
import { MutableRefObject, RefObject, useState } from "react";

export default function Footer({
  videoMediaStream,
  peerConnections,
  localStream,
  logout,
}: {
  videoMediaStream: MediaStream | null;
  peerConnections: MutableRefObject<Record<string, RTCPeerConnection>>;
  localStream: RefObject<HTMLVideoElement>;
  logout: () => void;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const date = new Date();
  const hours = date.getHours().toString().padStart(2, "0") + ":";
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const toggleMuted = () => {
    setIsMuted(!isMuted);
    videoMediaStream?.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });

    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track?.kind === "audio") {
          const track = videoMediaStream
            ?.getAudioTracks()
            .find((track) => track.kind === "audio");

          if (track) sender.replaceTrack(track);
        }
      });
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    videoMediaStream?.getVideoTracks().forEach((track) => {
      track.enabled = isVideoOff;
    });

    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track?.kind === "video") {
          const track = videoMediaStream
            ?.getVideoTracks()
            .find((track) => track.kind === "video");

          if (track) sender.replaceTrack(track);
        }
      });
    });
  };

  const toggleScreenSharing = async () => {
    setIsScreenSharing(!isScreenSharing);
    if (!isScreenSharing) {
      const videoShareScreen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        // audio: true,
      });

      if (localStream.current) {
        localStream.current.srcObject = videoShareScreen;
      }

      Object.values(peerConnections.current).forEach((peerConnection) => {
        peerConnection.getSenders().forEach((sender) => {
          if (sender.track?.kind === "video") {
            sender.replaceTrack(videoShareScreen.getVideoTracks()[0]);
          }
        });
      });

      return;
    }

    if (localStream.current) {
      localStream.current.srcObject = videoMediaStream;
    }

    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track?.kind === "video") {
          const track = videoMediaStream
            ?.getVideoTracks()
            .find((track) => track.kind === "video");

          if (track) sender.replaceTrack(track);
        }
      });
    });
  };

  return (
    <div className="fixed bottom-0 bg-black py-6 w-full">
      <Container>
        <div className="grid grid-cols-3">
          <div className="flex items-center">
            <p className="text-xl">
              {hours}
              {minutes}
            </p>
          </div>
          <div className="flex space-x-6 justify-center">
            {isMuted ? (
              <MicOff
                onClick={() => toggleMuted()}
                className="h-12 w-16 cursor-pointer text-white p-2 bg-red-500 rounded-md"
              />
            ) : (
              <Mic
                onClick={() => toggleMuted()}
                className="h-12 w-16 cursor-pointer text-white p-2 bg-gray-950 rounded-md"
              />
            )}
            {isVideoOff ? (
              <VideoOff
                onClick={() => toggleVideo()}
                className="h-12 w-16 cursor-pointer text-white p-2 bg-red-500 rounded-md"
              />
            ) : (
              <Video
                onClick={() => toggleVideo()}
                className="h-12 w-16 cursor-pointer text-white p-2 bg-gray-950 rounded-md"
              />
            )}
            {isScreenSharing ? (
              <MonitorOff
                onClick={() => toggleScreenSharing()}
                className="h-12 w-16 cursor-pointer text-white p-2 bg-red-500 rounded-md"
              />
            ) : (
              <Monitor
                onClick={() => toggleScreenSharing()}
                className="h-12 w-16 cursor-pointer text-white p-2 bg-gray-950 rounded-md"
              />
            )}

            <Phone
              onClick={logout}
              className="h-12 w-16 cursor-pointer text-white hover:bg-red-500 p-2 bg-primary rounded-md"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
