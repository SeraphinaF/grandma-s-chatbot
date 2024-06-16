import React, { useState, useEffect } from "react";

function ChatBot() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [controller, setController] = useState(new AbortController());

  useEffect(() => {
    // Save chat history to localStorage whenever it's updated
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    // Scroll to the bottom whenever a new message is added
    const chatContainer = document.getElementById("chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [chatHistory]);

  const fetchChat = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any previous errors
    const newController = new AbortController();
    setController(newController);

    try {
      const response = await fetch(
        "https://grandma-s-chatbot-server.vercel.app/chat",
        {
          mode: "cors",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
          signal: newController.signal, // Attach the signal
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setAnswer(data.answer);
      setError("");
      // Update chat history and save to localStorage
      setChatHistory((prevHistory) => {
        const newHistory = [
          ...prevHistory,
          { role: "human", text: message },
          { role: "system", text: data.answer },
        ];
        localStorage.setItem("chatHistory", JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error:", error);
        setError(
          "Oeps er is iets misgegaan. Oma doet even een dutje. Probeer het later nog eens."
        );
      }
    } finally {
      setIsLoading(false);
      setMessage(""); // Clear the input field after sending
    }
  };

  function cancelApiCall() {
    if (controller) {
      controller.abort();
      setError("Fetch canceled by user.");
      setIsLoading(false);
    }
  }

  return (
    <main className="bg-black-100">
      <div className="flex flex-col h-screen">
        <div
          id="chat-container"
          className="flex-1 p-4 w-[45rem] overflow-y-auto"
        >
          {chatHistory.map((msg, index) => (
            <p
              key={index}
              className={`rounded-xl p-3 m-4 font-medium ${
                msg.role === "system"
                  ? "text-grey-600 bg-pink-300 "
                  : "text-pink-500 bg-gray-200 text-end"
              }`}
            >
              {msg.text}
            </p>
          ))}
        </div>
        <div className="p-4 fixed bottom-0 left-8">
          <form method="post" onSubmit={fetchChat}>
            <input
              type="text"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-200 px-6 pr-60 py-2 rounded-xl"
              placeholder="Type a message..."
              disabled={isLoading} 
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-pink-500 text-white px-4 py-2 rounded-xl ml-4 hover:bg-pink-600 }`}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              onClick={cancelApiCall}
              className={`bg-red-500 text-white px-4 py-2 rounded-xl ml-4 hover:bg-red-600 ${
                isLoading ? "" : "hidden"
              }`}
            >
              Cancel
            </button>
          </form>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </main>
  );
}

export default ChatBot;
