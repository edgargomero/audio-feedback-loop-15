
import { Card } from "./ui/card";
import { RecordButton } from "./audio/RecordButton";
import { UploadButton } from "./audio/UploadButton";
import { FeedbackDisplay } from "./audio/FeedbackDisplay";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { RecordingProgress } from "./audio/RecordingProgress";
import { AnalysisResult } from "./audio/AnalysisResult";
import { useAudioRecorder } from "../hooks/use-audio-recorder";
import { useAudioUpload } from "../hooks/use-audio-upload";

export const AudioFeedback = () => {
  const { feedback } = useSalesAnalysis();
  const {
    isRecording,
    progressValue,
    recordingTime,
    formatTime,
    handleStartRecording,
    handleStopRecording,
  } = useAudioRecorder();
  const {
    analysisResult,
    handleFileUpload,
    handleDownloadPDF,
  } = useAudioUpload();

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-10 shadow-lg bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-center">Subir Archivo de Audio</h2>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
          <TabsTrigger value="record">Grabar Audio</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <UploadButton onFileUpload={handleFileUpload} />
        </TabsContent>
        <TabsContent value="record">
          <div className="text-center space-y-6">
            <RecordButton 
              isRecording={isRecording}
              onToggleRecording={
                isRecording 
                  ? handleStopRecording 
                  : () => handleStartRecording(handleFileUpload)
              }
            />
            {isRecording && (
              <RecordingProgress
                progressValue={progressValue}
                recordingTime={recordingTime}
                formatTime={formatTime}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {feedback.message && (
        <div className="mt-6">
          <FeedbackDisplay 
            type={feedback.type}
            message={feedback.message}
            stage={feedback.stage}
          />
        </div>
      )}

      {analysisResult && (
        <AnalysisResult 
          analysisResult={analysisResult}
          onDownload={handleDownloadPDF}
        />
      )}
    </Card>
  );
};
