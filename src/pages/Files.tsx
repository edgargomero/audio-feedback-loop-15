
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileList } from "@/components/files/FileList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

export default function Files() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    try {
      // Eliminar el archivo del storage
      const { error: storageError } = await supabase.storage
        .from('audio_chunks')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Eliminar el registro de la base de datos
      const { error: dbError } = await supabase
        .from('audio_files')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: "Éxito",
        description: "Archivo eliminado correctamente",
      });

      // Actualizar la lista de archivos
      setFiles(files.filter(file => file.id !== id));

    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Archivos</h1>
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <FileList files={files} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  );
}
