
import { Star, Target, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  imageUrl?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Ana Martínez",
    role: "Directora de Ventas",
    quote: "Gracias a esta herramienta, nuestro equipo ha mejorado significativamente su tasa de conversión. El feedback en tiempo real es invaluable.",
    rating: 5,
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Carlos Rodríguez",
    role: "Manager Comercial",
    quote: "La precisión del análisis nos ha ayudado a identificar áreas de mejora que antes pasábamos por alto. Totalmente recomendado.",
    rating: 5,
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Laura Sánchez",
    role: "Consultora Senior",
    quote: "Una herramienta imprescindible para cualquier equipo de ventas que quiera llevar sus resultados al siguiente nivel.",
    rating: 5,
    imageUrl: "/placeholder.svg"
  }
];

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export const TestimonialsAndStats = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Testimonials Section */}
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {testimonial.imageUrl && (
                        <img
                          src={testimonial.imageUrl}
                          alt={testimonial.name}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <RatingStars rating={testimonial.rating} />
                  <p className="text-gray-600 dark:text-gray-300 italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  90%
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Precisión en Análisis
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  +100
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Equipos Optimizados
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <TrendingUp className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  40%
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Más Cierres de Ventas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
