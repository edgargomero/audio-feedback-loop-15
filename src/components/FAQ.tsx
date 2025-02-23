
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const FAQ = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Preguntas Frecuentes
        </h2>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="seguridad" className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              ¿Cómo garantizan la seguridad de mis datos?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Utilizamos encriptación de extremo a extremo y seguimos los más altos estándares de seguridad. 
              Tus datos son almacenados de forma segura y nunca compartimos información sensible con terceros. 
              Cumplimos con GDPR y otras regulaciones de protección de datos.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="informes" className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              ¿Cuánto tardan en entregarse los informes?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Los análisis básicos están disponibles de forma instantánea. Para análisis más detallados, 
              el tiempo máximo de entrega es de 24 horas. Los usuarios del plan Pro reciben feedback en 
              tiempo real durante sus llamadas.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="soporte" className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              ¿Qué tipo de soporte ofrecen?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Ofrecemos soporte por correo electrónico 24/7 para todos los planes. Los usuarios del plan 
              Medio tienen acceso a chat en vivo, mientras que los usuarios Pro cuentan con un asesor 
              personal dedicado y soporte prioritario.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="integracion" className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              ¿Se puede integrar con otras herramientas?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Sí, nuestra plataforma se integra con las principales herramientas de CRM y ventas como 
              Salesforce, HubSpot, y Zoom. También ofrecemos una API para integraciones personalizadas 
              en el plan Pro.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="prueba" className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              ¿Puedo probar el servicio antes de comprometerme?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Sí, ofrecemos una prueba gratuita de 14 días con todas las funcionalidades del plan Medio. 
              No requerimos tarjeta de crédito para comenzar y puedes cancelar en cualquier momento.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
