import React, { useState, useEffect } from "react";

function Chat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState(() => {
    // Ophalen van chatgeschiedenis uit localStorage bij initiële laad
    const savedHistory = localStorage.getItem("chatHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    // Opslaan van chatgeschiedenis in localStorage telkens wanneer deze wordt bijgewerkt
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    // Scroll naar beneden zodra er een nieuw bericht wordt toegevoegd
    const chatContainer = document.getElementById("chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [chatHistory]);

  const fetchChat = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("https://grandma-s-chatbot-server.vercel.app/chat", {
        mode: 'cors',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setAnswer(data.answer);
      setError("");
      // Update de chatgeschiedenis en sla deze op in localStorage
      setChatHistory((prevHistory) => {
        const newHistory = [...prevHistory, { role: "human", text: message }, { role: "system", text: data.answer }];
        localStorage.setItem("chatHistory", JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error("Error:", error);
      setError("Oeps er is iets misgegaan. Oma doet even een dutje. Probeer het later nog eens.");
    } finally {
      setIsLoading(false);
      setMessage(""); // Leegt het invoerveld voor berichten na verzending
    }
  };

  return (
    <main className="bg-black-100">
      <div className="flex flex-col h-screen">
        <div id="chat-container" className="flex-1 p-4 w-[45rem] overflow-y-auto">
          {chatHistory.map((msg, index) => (
            <p key={index} className={`rounded-xl p-3 m-4 font-medium ${msg.role === "system" ? "text-grey-600 bg-pink-300 " : "text-pink-500 bg-gray-200 text-end"}`}>
              {msg.text}
            </p>
          ))}
        </div>
        <div className="p-4 fixed bottom-0 left-[12rem]">
          <form method="post" onSubmit={fetchChat}>
            <input
              type="text"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-200 p-28 py-2 rounded-xl"
              placeholder="Type a message here and hit Enter..."
            />
            <button
              onClick={fetchChat}
              disabled={isLoading}
              className={`bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600 focus:outline-none focus:ring focus:border-pink-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </main>
  );
}

export default Chat;
