
export type SalesStage = 1 | 2 | 3 | 4;

export interface SalesAnalysis {
  stage: SalesStage;
  matchScore: number;
  courtesyScore: number;
  decisionMaker: boolean;
  brandValues: boolean;
  contactInfo: {
    name?: string;
    phone?: string;
    email?: string;
  } | null;
  urgencyLevel?: number;
  needsIdentified?: string[];
  closingTechnique?: string;
  feedback: string;
}

export interface StageDetails {
  name: string;
  description: string;
  successCriteria: string[];
}

export const SALES_STAGES: Record<SalesStage, StageDetails> = {
  1: {
    name: "Acercamiento",
    description: "Presentación y generación de match",
    successCriteria: ["Presentación clara", "Empatía inicial", "Rapport establecido"],
  },
  2: {
    name: "Necesidades",
    description: "Levantamiento necesidades y calificación",
    successCriteria: ["Identificar urgencia", "Detectar necesidades", "Expectativas claras"],
  },
  3: {
    name: "Negociación",
    description: "Presentación de propuesta y valor agregado",
    successCriteria: ["Propuesta clara", "Valor agregado", "Manejo de objeciones"],
  },
  4: {
    name: "Cierre",
    description: "Técnicas de cierre y confirmación",
    successCriteria: ["Técnica de cierre", "Compromiso", "Próximos pasos"],
  },
};
