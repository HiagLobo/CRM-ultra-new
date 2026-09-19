/**
 * Marca — fonte única de verdade (nome, contato, dados jurídicos, domínio).
 * Trocar aqui reflete em todo o app. O logo é vetor em /public/assets/logo*.svg.
 * Pode ser importado no cliente ou no servidor (não contém segredos).
 *
 * Campos opcionais (`creci`) somem da tela quando vazios — é o que permite ir ao
 * ar sem inventar dado que ainda não existe.
 */
export interface BrandConfig {
  nome: string;
  nomeCurto: string;
  tagline: string;
  contato: {
    email: string;
    whatsapp: string;
    telefone: string;
    /** Endereço completo. Vazio = o bloco não aparece. */
    endereco?: string;
  };
  /** Quem responde pelo sistema — aparece no rodapé e na Política de Privacidade. */
  empresa: {
    razaoSocial: string;
    cnpj: string;
    /** Só para quem opera como imobiliária. Vazio = não exibido. */
    creci?: string;
  };
  dominio: string;
  /** Liga avisos/banners de demonstração. Desligar quando virar produto real. */
  demoMode: boolean;
}

export const brand: BrandConfig = {
  nome: "CRM Imobiliário Ultra",
  nomeCurto: "CRM Ultra",
  tagline: "O CRM imobiliário que fecha mais negócios.",
  contato: {
    // mesmo domínio do remetente do código (Reply-To alinhado ao From) — O9
    email: "comercial@crmultra.com.br",
    // formato com DDI para o link do WhatsApp sair correto
    whatsapp: "+55 81 99450-9609",
    telefone: "(81) 99450-9609",
    endereco: undefined,
  },
  empresa: {
    razaoSocial: "Safe Guardian Segurança Cibernética",
    cnpj: "50.997.804/0001-85",
    // Safe Guardian não opera como imobiliária: sem CRECI, e o rodapé omite.
    creci: undefined,
  },
  dominio: "crmultra.com.br",
  demoMode: true,
};

/** Link de WhatsApp a partir do número configurado (só os dígitos). */
export function linkWhatsapp(mensagem?: string): string {
  const numero = brand.contato.whatsapp.replace(/\D/g, "");
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${numero}${texto}`;
}

/** Atribuição de quem construiu o sistema, para o rodapé. */
export function feitoPor(): string {
  return `Sistema feito por ${brand.empresa.razaoSocial}`;
}

/** Linha de copyright do rodapé, montada só com o que estiver preenchido. */
export function linhaCopyright(ano: number): string {
  const partes = [`© ${ano} ${brand.empresa.razaoSocial}`, `CNPJ ${brand.empresa.cnpj}`];
  if (brand.empresa.creci) partes.push(`CRECI ${brand.empresa.creci}`);
  return partes.join(" · ");
}
