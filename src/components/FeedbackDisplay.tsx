
import { ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";
import { FeedbackState } from "../types/feedback";

interface FeedbackDisplayProps {
  feedback: FeedbackState;
}

const getFeedbackColor = (type: FeedbackState["type"]) => {
  switch (type) {
    case "positive":
      return "bg-green-100 text-green-800";
    case "negative":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getFeedbackIcon = (type: FeedbackState["type"]) => {
  switch (type) {
    case "positive":
      return <ThumbsUp className="w-6 h-6" />;
    case "negative":
      return <ThumbsDown className="w-6 h-6" />;
    default:
      return <AlertCircle className="w-6 h-6" />;
  }
};

export const FeedbackDisplay = ({ feedback }: FeedbackDisplayProps) => {
  return (
    <div className={`p-4 rounded-lg feedback-transition ${getFeedbackColor(feedback.type)}`}>
      <div className="flex items-center justify-center space-x-2">
        {getFeedbackIcon(feedback.type)}
        <p className="text-center text-lg font-medium">{feedback.message}</p>
      </div>
      {feedback.stage && (
        <p className="text-center text-sm mt-2">
          Etapa {feedback.stage}
        </p>
      )}
    </div>
  );
};
