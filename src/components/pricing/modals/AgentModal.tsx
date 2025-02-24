
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "../../chat/ChatMessage";

interface AgentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Array<{
    text: string;
    isAgent: boolean;
    feedback?: { emoji: string; phrase: string };
  }>;
  onStop: () => void;
}

export const AgentModal = ({ isOpen, onOpenChange, messages, onStop }: AgentModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onStop();
      onOpenChange(open);
    }}>
      <DialogContent 
        aria-describedby="agent-modal-description" 
        className="max-w-4xl h-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Conversación con el Agente</DialogTitle>
          <DialogDescription id="agent-modal-description">
            Interactúa con nuestro agente inteligente para analizar tu audio.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <ScrollArea className="h-[400px] p-4 rounded-md border">
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.text}
                  isAgent={message.isAgent}
                  feedback={message.feedback}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-center">
            <Button 
              onClick={onStop}
              variant="destructive"
              className="w-full max-w-xs"
            >
              Finalizar Conversación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
