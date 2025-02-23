
import { MessageCircle, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isAgent: boolean;
  feedback?: {
    emoji: string;
    phrase: string;
  };
}

export const ChatMessage = ({ message, isAgent, feedback }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        {isAgent ? <MessageCircle size={16} /> : <User size={16} />}
      </div>
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div className={`rounded-lg p-3 ${
          isAgent 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-primary text-primary-foreground'
        }`}>
          {message}
        </div>
        {feedback && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <span>{feedback.emoji}</span>
            <span className="font-medium">{feedback.phrase}</span>
          </div>
        )}
      </div>
    </div>
  );
};
