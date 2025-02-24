
import { PricingCard } from "./PricingCard";
import { UploadModal } from "./modals/UploadModal";
import { AgentModal } from "./modals/AgentModal";
import { plans } from "@/config/planConfig";
import { useConversationHandler } from "@/hooks/use-conversation-handler";
import { usePlanSelection } from "@/hooks/use-plan-selection";

export const PricingCards = () => {
  const {
    messages,
    handleStartAgent,
    handleStopAgent
  } = useConversationHandler();

  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    isAgentModalOpen,
    setIsAgentModalOpen,
    handleFileUpload,
    handlePlanSelection
  } = usePlanSelection();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            {...plan}
            onSelect={(planType) => handlePlanSelection(planType, handleStartAgent)}
          />
        ))}
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onFileUpload={handleFileUpload}
      />

      <AgentModal 
        isOpen={isAgentModalOpen}
        onOpenChange={setIsAgentModalOpen}
        messages={messages}
        onStop={handleStopAgent}
      />
    </div>
  );
};
