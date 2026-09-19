"use client";
/**
 * Seção "Recursos": o que o CRM faz. Cada bloco espelha um módulo que existe
 * nos painéis do demo — nada aqui promete o que a demonstração não mostra.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Secao, Eyebrow, Titulo, Sub, Cartao } from "./ui";

const RECURSOS: { icone: string; titulo: string; texto: string }[] = [
  {
    icone: "sparkles",
    titulo: "Assistente que adianta o trabalho",
    texto:
      "O assistente atende primeiro, descobre o que o cliente procura, orçamento e urgência, e entrega a conversa já qualificada, com a ficha preenchida e a etapa do funil no lugar certo.",
  },
  {
    icone: "kanban-square",
    titulo: "Funil de vendas",
    texto:
      "Cada lead numa etapa clara, do primeiro contato ao fechamento. Você vê onde o negócio parou e o que fazer em seguida.",
  },
  {
    icone: "message-circle",
    titulo: "Atendimento centralizado",
    texto:
      "Conversas, modelos de mensagem, agenda de visitas e ficha do cliente na mesma tela, sem pular entre aplicativos.",
  },
  {
    icone: "target",
    titulo: "Radar de captação",
    texto:
      "Mapa de oportunidades, alertas e avaliação de imóveis para chegar antes no proprietário que vai vender.",
  },
  {
    icone: "building-2",
    titulo: "Carteira de imóveis",
    texto:
      "Cadastro, fotos, curadoria e status de cada imóvel, com o histórico de quem trabalhou aquela oportunidade.",
  },
  {
    icone: "users",
    titulo: "Gestão da equipe",
    texto:
      "Corretores associados, metas, fechamentos, cobranças e jurídico na visão de quem administra a imobiliária.",
  },
  {
    icone: "percent",
    titulo: "Comissões e financeiro",
    texto:
      "Divisão de comissão, repasses e relatórios: o dinheiro de cada negócio rastreado do começo ao fim.",
  },
];

export default function Recursos() {
  return (
    <Secao id="recursos" fundo={p.page}>
      <div style={{ maxWidth: 720, marginBottom: 40 }}>
        <Eyebrow>O que o {brand.nomeCurto} faz</Eyebrow>
        <Titulo>Tudo o que o dia do corretor exige, num sistema só</Titulo>
        <Sub>
          Seis frentes que você percorre na demonstração: os mesmos módulos que o time usa no dia a
          dia, com dados fictícios para você explorar sem medo.
        </Sub>
      </div>

      <div
        className="ds-cards"
        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}
      >
        {RECURSOS.map((r) => (
          <Cartao key={r.titulo} icone={r.icone} titulo={r.titulo}>
            {r.texto}
          </Cartao>
        ))}
      </div>
    </Secao>
  );
}
