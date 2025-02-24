
let conversationId: string | null = null;

export const setConversationId = (id: string) => {
  conversationId = id;
  console.log('Global Conversation ID set:', id);
};

export const getConversationId = () => {
  return conversationId;
};

export const clearConversationId = () => {
  conversationId = null;
  console.log('Global Conversation ID cleared');
};

