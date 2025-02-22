
import { SalesStage } from "../../types/sales";

interface FeedbackDisplayProps {
  type: "positive" | "neutral" | "negative";
  message: string;
  stage?: SalesStage;
}

export const FeedbackDisplay = ({ type, message, stage }: FeedbackDisplayProps) => {
  const getFeedbackColor = (type: "positive" | "neutral" | "negative") => {
    switch (type) {
      case "positive":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
      case "negative":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className={`p-4 rounded-lg feedback-transition ${getFeedbackColor(type)}`}>
      <div className="flex items-center justify-center space-x-2">
        <p className="text-center text-lg font-medium">{message}</p>
      </div>
      {stage && (
        <p className="text-center text-sm mt-2">
          Etapa {stage}
        </p>
      )}
    </div>
  );
};
