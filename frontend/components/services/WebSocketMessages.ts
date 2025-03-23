export const connectToRoom = async (roomId: string) => {
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
  const ws: WebSocket = new WebSocket(`${WS_URL}?roomId=${roomId}`);
//   if (!ws) {
//     return null;
//   }
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "room-join",
        roomId: roomId,
      })
    );
  }

  return ws;
};
