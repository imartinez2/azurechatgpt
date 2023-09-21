"use client";

import { Message } from "ai";
import { RefObject, useEffect, useState } from "react";

export const useChatScrollAnchor = (
  chats: Message[],
  ref: RefObject<HTMLDivElement>
) => {
	const [isAtBottom, setIsAtBottom] = useState(true);

	// Update isAtBottom whenever the user scrolls
	useEffect(() => {
	  const handleScroll = () => {
		const { scrollTop, scrollHeight, clientHeight } = ref.current as HTMLDivElement;
		const atBottomOfChat = scrollTop + clientHeight >= scrollHeight;
		setIsAtBottom(atBottomOfChat);
	  };
  
	  if (ref.current) {
		ref.current.addEventListener('scroll', handleScroll);
	  }
  
	  return () => {
		if (ref.current) {
		  ref.current.removeEventListener('scroll', handleScroll);
		}
	  };
	}, [ref]);
  
	// Scroll to the bottom if isAtBottom is true
	useEffect(() => {
	  if (isAtBottom && ref.current) {
		ref.current.scrollTop = ref.current.scrollHeight;
	  }
	}, [chats, ref, isAtBottom]);
};
