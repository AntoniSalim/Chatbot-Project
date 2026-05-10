const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

const conversation = [];

function appendMessage(role, text) {
  const message = document.createElement("div");
  message.classList.add("message", role);
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);

  conversation.push({
    role: "user",
    text: userMessage,
  });

  input.value = "";

  const thinkingMessage = appendMessage("bot", "EduMate sedang berpikir...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get response from server");
    }

    const botReply = data.result || "Maaf, tidak ada respons dari AI.";

    thinkingMessage.textContent = botReply;

    conversation.push({
      role: "model",
      text: botReply,
    });
  } catch (error) {
    console.error(error);
    thinkingMessage.textContent =
      "Maaf, terjadi kesalahan saat menghubungi server.";
  }
});