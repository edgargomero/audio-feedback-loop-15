
import { Mic, BarChart2, MessagesSquare } from "lucide-react";
import { Button } from "./ui/button";

interface ActionButtonsProps {
  onRecordClick: () => void;
  onAnalysisClick: () => void;
  onConsultingClick: () => void;
}

export const ActionButtons = ({ onRecordClick, onAnalysisClick, onConsultingClick }: ActionButtonsProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button 
          onClick={onRecordClick}
          className="group relative h-32 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                   text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
                   hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-400/20 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Mic className="h-8 w-8" />
            </div>
            <span className="text-lg font-semibold">Grabar o Subir Audio</span>
          </div>
        </Button>

        <Button 
          onClick={onAnalysisClick}
          className="group relative h-32 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                   text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
                   hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-green-400/20 rounded-full group-hover:scale-110 transition-transform duration-300">
              <BarChart2 className="h-8 w-8" />
            </div>
            <span className="text-lg font-semibold">Análisis en Tiempo Real</span>
          </div>
        </Button>

        <Button 
          onClick={onConsultingClick}
          className="group relative h-32 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 
                   text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
                   hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-yellow-400/20 rounded-full group-hover:scale-110 transition-transform duration-300">
              <MessagesSquare className="h-8 w-8" />
            </div>
            <span className="text-lg font-semibold">Agendar Consultoría</span>
          </div>
        </Button>
      </div>
    </div>
  );
};
