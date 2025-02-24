
let conversationId: string | null = null;

export const setConversationId = (id: string) => {
  conversationId = id;
  console.log('Conversation ID set:', id);
};

export const getConversationId = () => conversationId;
