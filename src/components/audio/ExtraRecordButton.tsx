
import { Button } from "../ui/button";
import { Mic } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../integrations/supabase/client";

interface ExtraRecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const ExtraRecordButton = ({ isRecording, onToggleRecording }: ExtraRecordButtonProps) => {
  const { toast } = useToast();
  const BUCKET_NAME = import.meta.env.VITE_SUPABASE_BUCKET || "audio_chunks";

  const uploadToSupabase = async (audioBlob: Blob) => {
    try {
      const fileName = `recording-${Date.now()}.mp3`;
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, audioBlob);

      if (error) {
        throw error;
      }

      const { data: publicUrl } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      toast({
        title: "Éxito",
        description: "Audio subido correctamente a Supabase",
      });

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      toast({
        title: "Error",
        description: "Error al subir el archivo a Supabase",
        variant: "destructive",
      });
      return null;
    }
  };

  return (
    <Button
      onClick={onToggleRecording}
      variant="outline"
      className={`w-16 h-16 rounded-full flex items-center justify-center ${
        isRecording ? "recording-pulse" : ""
      }`}
    >
      <Mic className="w-6 h-6" />
    </Button>
  );
};
