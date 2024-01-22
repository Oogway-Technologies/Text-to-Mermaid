import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { FC, useState } from "react";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SYSTEM_PROMPT } from "../prompts/system_prompt";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
  temperature: 0.0,
  //   modelName: "gpt-4-1106-preview",
  modelName: "gpt-4-1106-preview",
  maxTokens: 1000,
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
});

const outputParser = new StringOutputParser();

type ChatHistory = (AIMessage | HumanMessage | SystemMessage)[];
const SystemPrompt = new SystemMessage(SYSTEM_PROMPT);

interface InputTextProps {
  setInput: (input: string) => void;
}

const InputText: FC<InputTextProps> = ({ setInput }) => {
  const [inputText, setInputText] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatHistory>([]);

  const invokeChain = async () => {
    const newHumanMessage = new HumanMessage(inputText);
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemPrompt,
      ...chatHistory,
      newHumanMessage,
    ]);

    // Clear input text
    setInputText("");
    const chain = chatPrompt.pipe(model).pipe(outputParser);
    const result = await chain.invoke({});

    // Update chat history
    const newAIMessage = new AIMessage(result);
    setChatHistory((prev) => prev.concat([newHumanMessage, newAIMessage]));
    // Return the result
    setInput(result);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    invokeChain();
  };

  return (
    <form className="flex w-full mt-3 gap-x-3 items-center" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Message the agent..."
        className="input input-bordered w-full"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <div className="flex w-[8rem]">
        <button type="submit" className="btn btn-secondary w-full">
          Send
        </button>
      </div>
    </form>
  );
};

export default InputText;
