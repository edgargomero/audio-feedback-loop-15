
let conversationId: string | null = null;

export const setConversationId = (id: string) => {
  conversationId = id;
  localStorage.setItem('id_conversation_medio', id);
  console.log('Conversation ID set:', id);
};

export const getConversationId = () => {
  if (!conversationId) {
    conversationId = localStorage.getItem('id_conversation_medio');
  }
  return conversationId;
};

