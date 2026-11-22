"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type ChatBotType from "./ChatBot";

// The chat widget (and its answer engine) isn't needed to render or interact with the
// page, so load it as a separate chunk after hydration instead of in the main bundle.
const ChatBot = dynamic(() => import("./ChatBot"), { ssr: false });

export default function ChatBotLazy(props: ComponentProps<typeof ChatBotType>) {
  return <ChatBot {...props} />;
}
