
import { AudioFeedback } from "@/components/AudioFeedback";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Análisis de Ventas en Tiempo Real
          </h1>
          <p className="text-lg text-gray-600">
            Obtén feedback instantáneo durante tus llamadas de ventas
          </p>
        </div>
        <AudioFeedback />
      </div>
    </div>
  );
};

export default Index;
