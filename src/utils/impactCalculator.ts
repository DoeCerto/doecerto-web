/**
 * Motor de Cálculo de Impacto Tangível (Padrão Ouro GoFundMe / Charity:Water / Benevity)
 * Converte reais (R$) ou quantidades de itens materiais em unidades compreensíveis de impacto social.
 */

export interface ImpactConfig {
  costPerUnit: number;
  unitSingular: string;
  unitPlural: string;
  actionVerb: string;
  icon: string;
  timeScope?: string;
}

export interface ImpactResult {
  units: number;
  unitLabel: string;
  impactText: string;
  actionVerb: string;
  icon: string;
  categoryName: string;
  isEquivalence: boolean; // Flag de salvaguarda jurídica (equivale a / ajuda estimada)
}

/**
 * Tabela de Benchmarks das 12 Categorias Oficiais do DoeCerto
 */
export const CATEGORY_IMPACT_CONFIG: Record<string, ImpactConfig> = {
  "Proteção Animal": {
    costPerUnit: 15.0,
    unitSingular: "animal resgatado",
    unitPlural: "animais resgatados",
    actionVerb: "alimentar e acolher",
    icon: "🐾",
    timeScope: "por cerca de 1 dia",
  },
  "Alimentação": {
    costPerUnit: 10.0,
    unitSingular: "refeição nutritiva",
    unitPlural: "refeições nutritivas",
    actionVerb: "garantir",
    icon: "🍲",
    timeScope: "para quem tem fome",
  },
  "Educação": {
    costPerUnit: 20.0,
    unitSingular: "criança com apoio escolar",
    unitPlural: "crianças com apoio escolar",
    actionVerb: "apoiar e incentivar",
    icon: "🎒",
    timeScope: "com oficinas e materiais",
  },
  "Saúde": {
    costPerUnit: 25.0,
    unitSingular: "paciente amparado",
    unitPlural: "pacientes amparados",
    actionVerb: "cuidar de",
    icon: "🩺",
    timeScope: "com insumos e remédios básicos",
  },
  "Assistência Social": {
    costPerUnit: 30.0,
    unitSingular: "família em vulnerabilidade",
    unitPlural: "famílias em vulnerabilidade",
    actionVerb: "amparar diretamente",
    icon: "🤝",
    timeScope: "com acolhimento e suporte",
  },
  "Meio Ambiente": {
    costPerUnit: 12.0,
    unitSingular: "muda nativa preservada",
    unitPlural: "mudas nativas preservadas",
    actionVerb: "plantar e proteger",
    icon: "🌱",
    timeScope: "para reflorestamento",
  },
  "Cultura e Arte": {
    costPerUnit: 20.0,
    unitSingular: "jovem em oficinas culturais",
    unitPlural: "jovens em oficinas culturais",
    actionVerb: "incluir",
    icon: "🎨",
    timeScope: "com música e arte",
  },
  "Direitos Humanos": {
    costPerUnit: 25.0,
    unitSingular: "pessoa acolhida",
    unitPlural: "pessoas acolhidas",
    actionVerb: "proteger e orientar",
    icon: "⚖️",
    timeScope: "com assistência e suporte",
  },
  "Desenvolvimento Comunitário": {
    costPerUnit: 25.0,
    unitSingular: "família da comunidade",
    unitPlural: "famílias da comunidade",
    actionVerb: "fortalecer",
    icon: "🏘️",
    timeScope: "com projetos locais",
  },
  "Moradia": {
    costPerUnit: 35.0,
    unitSingular: "lar amparado",
    unitPlural: "lares amparados",
    actionVerb: "melhorar as condições de",
    icon: "🏠",
    timeScope: "com itens essenciais",
  },
  "Esporte e Lazer": {
    costPerUnit: 15.0,
    unitSingular: "criança em atividades esportivas",
    unitPlural: "crianças em atividades esportivas",
    actionVerb: "incentivar",
    icon: "⚽",
    timeScope: "com práticas saudáveis",
  },
  "Tecnologia e Inovação": {
    costPerUnit: 30.0,
    unitSingular: "aluno em capacitação digital",
    unitPlural: "alunos em capacitação digital",
    actionVerb: "capacitar",
    icon: "💻",
    timeScope: "para o mercado de trabalho",
  },
};

const DEFAULT_CONFIG: ImpactConfig = {
  costPerUnit: 20.0,
  unitSingular: "vida transformada",
  unitPlural: "vidas transformadas",
  actionVerb: "amparar e apoiar",
  icon: "✨",
  timeScope: "com assistência direta",
};

/**
 * Normaliza o nome da categoria para localizar no mapa
 */
function findConfig(categoryName?: string | null): { config: ImpactConfig; resolvedName: string } {
  if (!categoryName) {
    return { config: DEFAULT_CONFIG, resolvedName: "Solidariedade" };
  }

  const clean = categoryName.trim().toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_IMPACT_CONFIG)) {
    if (key.toLowerCase() === clean || clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      return { config: val, resolvedName: key };
    }
  }

  return { config: DEFAULT_CONFIG, resolvedName: categoryName };
}

/**
 * Calcula o impacto tangível com salvaguarda jurídica enterprise
 */
export function calculateImpact({
  amount,
  primaryCategoryName,
  donationType = "monetary",
  materialQuantity,
  materialDescription,
}: {
  amount?: number;
  primaryCategoryName?: string | null;
  donationType?: "monetary" | "material";
  materialQuantity?: number;
  materialDescription?: string;
}): ImpactResult {
  const { config, resolvedName } = findConfig(primaryCategoryName);

  // Caso 1: Doação Material de Itens
  if (donationType === "material") {
    const qty = Math.max(1, materialQuantity || 1);
    const desc = materialDescription?.toLowerCase() || "";

    let unit = qty === 1 ? "vida amparada" : "vidas amparadas";
    let icon = "📦";

    if (desc.includes("cesta") || desc.includes("alimento") || desc.includes("comida")) {
      unit = qty === 1 ? "família com alimento na mesa" : "famílias com alimento na mesa";
      icon = "🍲";
    } else if (desc.includes("ração") || desc.includes("pet") || desc.includes("animal")) {
      unit = qty === 1 ? "animal alimentado" : "animais alimentados";
      icon = "🐾";
    } else if (desc.includes("agasalho") || desc.includes("roupa") || desc.includes("cobertor")) {
      unit = qty === 1 ? "pessoa protegida do frio" : "pessoas protegidas do frio";
      icon = "🧥";
    } else if (desc.includes("livro") || desc.includes("escola") || desc.includes("caderno")) {
      unit = qty === 1 ? "criança com apoio escolar" : "crianças com apoio escolar";
      icon = "📚";
    }

    return {
      units: qty,
      unitLabel: unit,
      impactText: `Sua doação ajuda a beneficiar diretamente ~${qty} ${unit}.`,
      actionVerb: "entregar para",
      icon,
      categoryName: resolvedName,
      isEquivalence: true,
    };
  }

  // Caso 2: Doação Monetária (PIX)
  const val = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const rawUnits = val / config.costPerUnit;
  const units = Math.max(1, Math.floor(rawUnits));

  const unitLabel = units === 1 ? config.unitSingular : config.unitPlural;

  // UX Writing enterprise com salvaguarda jurídica ("equivale a...")
  let impactText = "";
  if (val <= 0) {
    impactText = `Cada R$ ${config.costPerUnit.toFixed(0)} equivale a ${config.actionVerb} 1 ${config.unitSingular}.`;
  } else if (val < config.costPerUnit) {
    impactText = `Sua doação ajuda a compor os cuidados essenciais para 1 ${config.unitSingular}.`;
  } else {
    impactText = `Sua doação equivale a ${config.actionVerb} ~${units} ${unitLabel}.`;
  }

  return {
    units: val > 0 ? units : 0,
    unitLabel,
    impactText,
    actionVerb: config.actionVerb,
    icon: config.icon,
    categoryName: resolvedName,
    isEquivalence: true,
  };
}
