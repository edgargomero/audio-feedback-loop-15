
export const startProgressAndTime = (
  setProgressValue: (value: number) => void,
  setRecordingTime: (value: number) => void,
  progressInterval: { current: NodeJS.Timeout | undefined },
  timeInterval: { current: NodeJS.Timeout | undefined }
) => {
  setProgressValue(0);
  setRecordingTime(0);
  
  progressInterval.current = setInterval(() => {
    setProgressValue(prev => {
      if (prev >= 100) {
        clearInterval(progressInterval.current);
        return 100;
      }
      return prev + 1;
    });
  }, 100);

  timeInterval.current = setInterval(() => {
    setRecordingTime(prev => prev + 1);
  }, 1000);
};

export const stopProgressAndTime = (
  progressInterval: { current: NodeJS.Timeout | undefined },
  timeInterval: { current: NodeJS.Timeout | undefined },
  setProgressValue: (value: number) => void
) => {
  if (progressInterval.current) clearInterval(progressInterval.current);
  if (timeInterval.current) clearInterval(timeInterval.current);
  setProgressValue(100);
};

export const startProcessingCountdown = (
  setIsProcessing: (value: boolean) => void,
  setProcessingTimeLeft: (value: number) => void,
  processingInterval: { current: NodeJS.Timeout | undefined },
  setAnalysisResult: (value: string | null) => void,
  toast: any
) => {
  setIsProcessing(true);
  setProcessingTimeLeft(120);

  processingInterval.current = setInterval(() => {
    setProcessingTimeLeft(prev => {
      if (prev <= 0) {
        clearInterval(processingInterval.current);
        setIsProcessing(false);
        setAnalysisResult("analysis_result.pdf");
        toast({
          title: "¡Análisis completado!",
          description: "PDF generado y listo para descargar ✅",
        });
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};
