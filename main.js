const CHANNEL_ID = "com.nassim.heyboi/message";

const statusElement = document.getElementById("status");
const button = document.getElementById("hey-boi-button");

const setStatus = (message, isError = false) => {
  if (!statusElement) {
    return;
  }
  statusElement.textContent = message;
  statusElement.style.color = isError ? "#ff6b6b" : "#f4f4f5";
};

const showNotification = async (message) => {
  const notification = window.OBR?.notification;
  if (notification?.show) {
    try {
      await notification.show(message);
      return;
    } catch (error) {
      console.warn("OBR.notification.show failed, falling back to alert", error);
    }
  }
  window.alert(message);
};

const handleBroadcast = async (event) => {
  const senderName =
    event?.data?.from?.name ??
    event?.sender?.name ??
    "Someone";
  await showNotification(`${senderName} says: Hey boi`);
};

const registerListeners = async () => {
  const broadcast = window.OBR?.broadcast;
  if (!broadcast) {
    setStatus("Broadcast API unavailable. Are you in Owlbear Rodeo?", true);
    return;
  }

  broadcast.onMessage(CHANNEL_ID, handleBroadcast);

  if (!button) {
    setStatus("Could not find the Hey Boi button.", true);
    return;
  }

  button.addEventListener("click", async () => {
    setStatus("Sending message...");
    try {
      if (!window.OBR.player) {
        throw new Error("Player API unavailable");
      }
      const [id, name] = await Promise.all([
        window.OBR.player.getId(),
        window.OBR.player.getName(),
      ]);

      await broadcast.sendMessage(CHANNEL_ID, {
        text: "Hey boi",
        from: { id, name },
        sentAt: Date.now(),
      });

      setStatus("Sent! Everyone should see it.");
    } catch (error) {
      console.error("Failed to send Hey boi broadcast", error);
      setStatus("Could not send the message.", true);
    }
  });
};

if (window.OBR?.onReady) {
  setStatus("Waiting for Owlbear Rodeo...");
  window.OBR.onReady(async () => {
    setStatus("Ready. Click the button to share the message.");
    await registerListeners();
  });
} else {
  setStatus("This extension only runs inside Owlbear Rodeo.", true);
}
