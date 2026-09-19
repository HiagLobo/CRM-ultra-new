/**
 * Leads com ação em andamento no painel (O9·S3, corrige uma corrida da O8): um
 * CONJUNTO de ids, não "o" lead ocupado. Com um id só, começar uma ação em B
 * "liberava" A no meio do PATCH dele — a ficha de A voltava com os botões
 * ativos e aceitava um segundo PATCH. Aqui, terminar A nunca libera B, e
 * começar B nunca libera A. Puro (o hook só guarda o estado), para o teste.
 */
export function marcarOcupado(atuais: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (atuais.has(id)) return atuais;
  return new Set([...atuais, id]);
}

export function liberarOcupado(atuais: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (!atuais.has(id)) return atuais;
  const restantes = new Set(atuais);
  restantes.delete(id);
  return restantes;
}
