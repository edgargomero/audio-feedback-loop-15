
import { SalesAnalysis } from "@/types/sales";

export const startProcessingCountdown = (
  setIsProcessing: (value: boolean) => void,
  setProcessingTimeLeft: React.Dispatch<React.SetStateAction<number>>,
  processingInterval: React.MutableRefObject<NodeJS.Timeout | undefined>,
  setResult: (result: any) => void,
  toast: any
) => {
  setIsProcessing(true);
  setProcessingTimeLeft(120);

  // Simular espera y chequear resultado
  const checkResult = async () => {
    try {
      const response = await fetch('https://hook.us2.make.com/fdfea2uux2sa7todteplybdudo45qpwm');
      
      if (!response.ok) {
        throw new Error('Error al obtener el resultado');
      }

      const responseData = await response.json();
      console.log('Respuesta del webhook:', responseData);
      
      if (responseData && responseData.output) {
        if (processingInterval.current) {
          clearInterval(processingInterval.current);
        }
        setIsProcessing(false);
        // Enviamos directamente el HTML contenido en output
        setResult(responseData.output);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al obtener resultado:', error);
      return false;
    }
  };

  let attempts = 0;
  processingInterval.current = setInterval(async () => {
    attempts++;
    
    // Actualizar tiempo restante
    setProcessingTimeLeft((prev) => {
      if (prev <= 1) {
        if (processingInterval.current) {
          clearInterval(processingInterval.current);
        }
        setIsProcessing(false);
        toast({
          title: "Tiempo agotado",
          description: "No se pudo obtener el resultado en el tiempo esperado",
          variant: "destructive",
        });
        return 0;
      }
      return prev - 1;
    });

    // Intentar obtener resultado
    const success = await checkResult();
    if (success || attempts >= 120) {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
      if (!success && attempts >= 120) {
        setIsProcessing(false);
        toast({
          title: "Tiempo agotado",
          description: "No se pudo obtener el resultado en el tiempo esperado",
          variant: "destructive",
        });
      }
    }
  }, 1000);
};

export const startProgressAndTime = (
  setProgressValue: (value: number) => void,
  setRecordingTime: (value: number) => void,
  progressInterval: React.MutableRefObject<NodeJS.Timeout | undefined>,
  timeInterval: React.MutableRefObject<NodeJS.Timeout | undefined>
) => {
  setProgressValue(0);
  setRecordingTime(0);

  let progress = 0;
  progressInterval.current = setInterval(() => {
    progress += 1;
    setProgressValue(progress);

    if (progress >= 100) {
      clearInterval(progressInterval.current);
    }
  }, 500);

  let time = 0;
  timeInterval.current = setInterval(() => {
    time += 1;
    setRecordingTime(time);
  }, 1000);
};

export const stopProgressAndTime = (
  progressInterval: React.MutableRefObject<NodeJS.Timeout | undefined>,
  timeInterval: React.MutableRefObject<NodeJS.Timeout | undefined>,
  setProgressValue: (value: number) => void
) => {
  if (progressInterval.current) clearInterval(progressInterval.current); // Corregido aquí
  if (timeInterval.current) clearInterval(timeInterval.current);
  setProgressValue(0);
};
