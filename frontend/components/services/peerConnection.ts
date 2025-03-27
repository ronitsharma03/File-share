"use client";

export const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },

    // Additional public STUN servers
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.sipgate.net:3478" },
    { urls: "stun:stun.schlund.de:3478" },
    { urls: "stun:stun.voiparound.com:3478" },
  ],
};

export function createPeerConnectionSender(
  ws: WebSocket,
  roomId: string,
  senderId: string,
  receiverId: string | null,
  onOfferCreated: (offer: any) => void
) {
  const pc = new RTCPeerConnection(rtcConfig);
  const dataChannel = pc.createDataChannel("fileTransfer");

  dataChannel.onopen = () => {
    console.log("Data channel opened");
  };

  dataChannel.onclose = () => {
    console.log("Data channel closed");

    dataChannel.onerror = (error) => {
      console.log("Data channel error: ", error);
    };
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(
        JSON.stringify({
          type: "ice-candidate",
          roomId,
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
  };

  return pc;
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
