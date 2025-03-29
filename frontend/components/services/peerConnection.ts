"use client";

export const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },

    {
      urls: "turn:numb.viagenie.ca",
      username: "webrtc@live.com",
      credential: "muazkh"
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ],
};

import { useTransferStore } from "../atoms/fileTransferAtoms";

export function createPeerConnectionSender(
  ws: WebSocket,
  roomId: string,
  senderId: string,
  receiverId: string | null,
  onOfferCreated: (offer: any) => void
) {
  const pc = new RTCPeerConnection(rtcConfig);
  const dataChannel = pc.createDataChannel("fileTransfer", {
    negotiated: false,
    ordered: true
  });

  dataChannel.onopen = () => {
    useTransferStore.getState().setChannel(dataChannel);
    console.log("Data channel opened");
  };

  dataChannel.onclose = () => {
    console.log("Data channel closed");

  };
  dataChannel.onerror = (error) => {
    console.log("Data channel error: ", error);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("onicecandidate triggered, candidate:", event.candidate);
      ws.send(
        JSON.stringify({
          type: "ice-candidate",
          roomId: roomId,
          candidate: event.candidate,
          fromClientId: senderId,
          toClientId: receiverId,
        })
      );
    }
  };

  pc.onnegotiationneeded = async () => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      onOfferCreated(offer.sdp);
    } catch (error) {
      console.error(`Error creating the offer :${error}`);
    }
  };

  pc.onconnectionstatechange = () => {
    console.log("connection state changed: ", pc.connectionState);
  };

  pc.oniceconnectionstatechange = () => {
    console.log("Ice connection state changed: ", pc.iceConnectionState);
    console.log("ICE Connection State:", pc.iceConnectionState);
  if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
    console.log("ICE connection successful!");
  } else if (pc.iceConnectionState === 'failed') {
    console.error("ICE connection failed");
  }
  };


  return { pc, dataChannel };
}

export async function createPeerConnectionReceiver(
  ws: WebSocket,
  roomId: string,
  receiverId: string,
  senderId: string,
  offer: string
): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection(rtcConfig);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("onicecandidate triggered, candidate:", event.candidate);
      ws.send(
        JSON.stringify({
          type: "ice-candidate",
          roomId: roomId,
          candidate: event.candidate,
          fromClientId: receiverId,
          toClientId: senderId,
        })
      );
    }
  };

  pc.ondatachannel = (event) => {
    const channel = event.channel;

    channel.onopen = () => {
      console.log("Data channel opened on receiver");
    };

    channel.onclose = () => {
      console.log("Data channel closed on receiver");
    };

    channel.onerror = (error) => {
      console.error("Data channel error on receiver:", error);
    };

    channel.onmessage = (ev) => {
      console.log(`Data received: ${ev.data.substring(0, 100)}...`); // Log just the beginning
      // Handle the received data (file chunks) here
    };
  };

  await pc.setRemoteDescription({ type: "offer", sdp: offer });
  console.log("Remote description set successfully");

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  console.log("Local description set successfully");

  try{

    ws.send(
      JSON.stringify({
        type: "answer",
        roomId: roomId,
        sdp: answer.sdp,
        fromClientId: receiverId,
        toClientId: senderId,
      })
    );
    console.log(`Answer sent to the sender successfully`);
  }catch(error){
    console.error(`Error sending the answer to the sender ${error}`);
  }

  return pc;
}
