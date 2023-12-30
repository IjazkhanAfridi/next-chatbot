"use client";

import { useEffect, useRef } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { LoadingCircle, UploadIcon, EditIcon } from "./icons";
import ReactMarkdown from "react-markdown";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";

const examples = [
  "What is AI",
  "Will AI Replace Developers",
  "what is the Next js",
  "What should i learn in 2024",
];

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        va.track("Rate limited");
        return;
      } else {
        va.track("Chat initiated");
      }
    },
    onError: (error) => {
      va.track("Chat errored", {
        input,
        error: error.message,
      });
    },
  });

  const disabled = isLoading || input.length === 0;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex min-h-screen h-full bg-[#11A080] ">
      <div className="w-[320px] fixed bg-[#394648] h-[100vh] ">
        <div className="w-[280px] mx-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center mt-2 cursor-pointer">
            <div className="w-[25px] h-[25px] bg-white flex rounded-md"></div>
            <p className="font-semibold text-lg text-white ml-2">Manu Magnet</p>
          </div>
          <EditIcon />
        </div>
        <div className="mt-6">
          <p className="font-medium text-gray-200">history</p>
        </div>
        </div>
      </div>
      <main className={clsx("w-full ml-[320px] min-h-full flex flex-col")}>
        {messages.length > 0 ? (
          messages.map((message, i) => (
            <div
              key={i}
              className={clsx("flex w-full items-center justify-center py-2", message.role === "user" ? "bg-transparent" : "bg-transparent",)}>
              <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
                <div className={clsx("p-1.5 text-white w-[50px] h-[40px] text-center", message.role === "assistant" ? "bg-green-500" : "bg-black",)}>
                  {message.role === "user" ? (<p>User</p>) : (<p>Bot</p>)}
                </div>
                <ReactMarkdown className="prose mt-1 w-full break-words prose-p:leading-relaxed" components={{ a: (props) => (<a {...props} target="_blank" rel="noopener noreferrer" />), }}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))
        ) : (
          <div className="mx-auto w-full max-w-screen-md h-full flex items-end">
            <div className="flex flex-wrap items-start w-full">
              {examples.map((example, i) => (
                <div className="w-[50%] p-2">
                  <button key={i} className="rounded-md w-full border border-[#394648] px-2 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                    onClick={() => {
                      setInput(example);
                      inputRef.current?.focus();
                    }}
                  >
                    {example}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="w-full mt-auto py-4 mb-4">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="relative w-full mx-auto max-w-screen-md rounded-xl border border-[#394648] bg-transparent px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
          >
            <Textarea
              ref={inputRef}
              tabIndex={0}
              required
              rows={1}
              autoFocus
              placeholder="Send a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  formRef.current?.requestSubmit();
                  e.preventDefault();
                }
              }}
              spellCheck={false}
              className="w-full pr-10 focus:outline-none bg-transparent myTextArea"
            />
            <button
              className={clsx(
                "absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all mr-3",
                disabled
                  ? "cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600",
              )}
              disabled={disabled}
            >
              {isLoading ? (
                <LoadingCircle />
              ) : (
                <UploadIcon
                  className={clsx(
                    "h-4 w-4",
                    input.length === 0 ? "text-gray-300" : "text-white",
                  )}
                />
              )}
            </button>
          </form>
        </div>
        <div ref={messagesEndRef}></div>
      </main>
    </div>
  );
}
