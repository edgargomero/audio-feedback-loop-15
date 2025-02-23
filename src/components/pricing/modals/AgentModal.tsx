
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AgentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStopAgent: () => void;
}

export const AgentModal = ({ isOpen, onOpenChange, onStopAgent }: AgentModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onStopAgent();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conversación con el Agente</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              El agente está escuchando. Habla para interactuar.
            </p>
            <Button 
              onClick={onStopAgent}
              variant="destructive"
            >
              Finalizar Conversación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
