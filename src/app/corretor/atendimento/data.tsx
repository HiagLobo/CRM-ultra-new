"use client";
import * as React from "react";
import { pal, Ic } from "@/components/corretor/CorretorChrome";
import { demo } from "@/config/demo";

/* ---- re-export so other files can import from here ---- */
export { pal, Ic };

/* ---------------- STAGE CONFIG ---------------- */
export const STAGES = ['Novo', 'Em atendimento', 'Visita', 'Proposta', 'Negociação'];
export const STAGE_META: Record<string, { c: string; bg: string; dot: string }> = {
  'Novo':           { c: '#4F46E5', bg: '#E0E7FF', dot: '#4F46E5' },
  'Em atendimento': { c: '#2563A8', bg: '#E5EEF7', dot: '#2563A8' },
  'Visita':         { c: '#2E9E5B', bg: '#E6F4EC', dot: '#2E9E5B' },
  'Proposta':       { c: '#B8860B', bg: '#FBF1DC', dot: '#E0A82E' },
  'Negociação':     { c: '#C0392B', bg: '#FAE5E5', dot: '#D64545' },
};

const AV: Record<string, [string, string]> = {
  mariana:  ['#6366F1', '#312E81'],
  joao:     ['#2E7D9E', '#1C4A63'],
  fernanda: ['#B5632F', '#7A3B16'],
  carlos:   ['#4338CA', '#231038'],
  beatriz:  ['#2E9E5B', '#176B3A'],
  rafael:   ['#5A6B8C', '#2E3A52'],
  patricia: ['#C2557A', '#7A2E4C'],
};

const m = (from: string, text: string, time: string, status: string | null): any => ({ from, text, time, status });
const audio = (from: string, dur: string, time: string, status: string | null): any => ({ from, type: 'audio', dur, time, status });

export const SEED: any[] = [
  {
    id: 'mariana', name: 'Mariana Costa', initials: 'MC', av: AV.mariana,
    stage: 'Visita', quente: true, novo: false, sla: null,
    lastTime: '09:41', unread: 0, windowHrs: 19,
    budget: 'Até R$ 950 mil', finalidade: 'Moradia', qualify: 'Quente',
    property: { title: 'Apto 3 quartos · Boa Viagem', area: '112 m²', price: 'R$ 890.000', code: '48213', specs: '3 quartos · 2 vagas' },
    handoff: {
      time: 'Hoje · 09:30', botQualify: 'Quente', urgencia: 'Alta · quer fechar este mês',
      resumo: 'Já vendeu o imóvel atual e procura 3 quartos em Boa Viagem com vista mar. Demonstrou forte intenção e pediu para visitar ainda esta semana.',
      fields: [
        ['building-2', 'Imóvel', 'Apto 3q · Boa Viagem · Cód 48213'],
        ['wallet', 'Orçamento', 'Até R$ 950 mil'],
        ['target', 'Finalidade', 'Moradia'],
        ['credit-card', 'Pagamento', 'Financiamento + entrada'],
      ],
    },
    timeline: [
      { t: 'Pré-atendimento pelo Assistente', d: 'Hoje · 09:18', icon: 'bot' },
      { t: 'Lead qualificado: Quente', d: 'Hoje · 09:29', icon: 'sparkles' },
      { t: 'Transferido para você', d: 'Hoje · 09:30', icon: 'arrow-right-left' },
      { t: '1ª resposta em 4 min', d: 'Hoje · 09:34', icon: 'zap' },
      { t: 'Visita agendada — amanhã 15h', d: 'Hoje · 09:40', icon: 'calendar-check', accent: true },
    ],
    messages: [
      m('them', 'Oi Ricardo! Vi o apartamento de Boa Viagem, achei lindo 😍 ainda dá pra visitar?', '09:32', null),
      audio('them', '0:14', '09:33', null),
      m('me', 'Oi Mariana, tudo bem? Dá sim! O apto de 112m² com 3 quartos e vista mar.', '09:34', 'read'),
      m('me', '', 'card', 'read'),
      m('them', 'Perfeito. Consigo ir amanhã à tarde?', '09:38', null),
      m('me', 'Consigo encaixar amanhã às 15h. Te confirmo o endereço por aqui 😉', '09:40', 'read'),
      m('them', 'Fechado! Amanhã 15h então. Obrigada!', '09:41', null),
    ],
  },
  {
    id: 'joao', name: 'João Pedro', initials: 'JP', av: AV.joao,
    stage: 'Novo', quente: false, novo: true, sla: null,
    lastTime: '11:58', unread: 2, windowHrs: 23,
    budget: 'Até R$ 650 mil', finalidade: 'Moradia', qualify: null,
    property: { title: 'Casa · Candeias', area: '180 m²', price: 'R$ 620.000', code: '50127', specs: '3 quartos · quintal' },
    handoff: {
      time: 'Hoje · 11:55', botQualify: 'Lead novo', urgencia: 'Média · pesquisando',
      resumo: 'Primeiro contato. Busca casa com quintal em Candeias para a família. Perguntou se o imóvel do anúncio ainda está disponível.',
      fields: [
        ['building-2', 'Imóvel', 'Casa · Candeias · Cód 50127'],
        ['wallet', 'Orçamento', 'Até R$ 650 mil'],
        ['target', 'Finalidade', 'Moradia · família'],
        ['credit-card', 'Pagamento', 'A confirmar'],
      ],
    },
    timeline: [
      { t: 'Pré-atendimento pelo Assistente', d: 'Hoje · 11:50', icon: 'bot' },
      { t: 'Transferido para você', d: 'Hoje · 11:55', icon: 'arrow-right-left' },
      { t: 'Aguardando 1ª resposta', d: 'Agora', icon: 'clock', accent: true },
    ],
    messages: [
      m('them', 'Oi, esse imóvel ainda está disponível?', '11:57', null),
      m('them', 'Casa em Candeias, vi no anúncio 50127', '11:58', null),
    ],
  },
  {
    id: 'rafael', name: 'Rafael Mendes', initials: 'RM', av: AV.rafael,
    stage: 'Em atendimento', quente: false, novo: false, sla: null,
    lastTime: '10:26', unread: 1, windowHrs: 20,
    budget: 'Até R$ 500 mil', finalidade: 'Moradia', qualify: 'Morno',
    property: { title: 'Apto 2 quartos · Aflitos', area: '64 m²', price: 'R$ 480.000', code: '51020', specs: '2 quartos · 1 vaga' },
    handoff: {
      time: 'Hoje · 10:15', botQualify: 'Morno', urgencia: 'Média · avaliando',
      resumo: 'Gostou do apartamento dos Aflitos e quer seguir com a visita. Bom potencial de fechamento no curto prazo.',
      fields: [
        ['building-2', 'Imóvel', 'Apto 2q · Aflitos · Cód 51020'],
        ['wallet', 'Orçamento', 'Até R$ 500 mil'],
        ['target', 'Finalidade', 'Moradia'],
        ['credit-card', 'Pagamento', 'Financiamento'],
      ],
    },
    timeline: [
      { t: 'Pré-atendimento pelo Assistente', d: 'Hoje · 10:10', icon: 'bot' },
      { t: 'Transferido para você', d: 'Hoje · 10:15', icon: 'arrow-right-left' },
      { t: 'Contato externo bloqueado', d: 'Hoje · 10:22', icon: 'shield-alert', warn: true },
    ],
    messages: [
      m('them', 'Gostei muito do apartamento dos Aflitos! Já quero seguir.', '10:20', null),
      m('me', 'Que ótimo, Rafael! Vou te passar todos os detalhes.', '10:21', 'read'),
      { from: 'me', kind: 'blocked', text: 'Me passa seu WhatsApp pessoal? Te chamo lá pra adiantar.', time: '10:22' },
      { from: 'system', kind: 'advisory', text: `Mensagem não entregue ao cliente. Para a segurança de todos, o atendimento acontece somente por este canal da ${demo.nomeCurto} — não combine contato por fora da plataforma.` },
      m('me', 'Perfeito! Consigo adiantar tudo por aqui mesmo. Qual o melhor dia pra visita?', '10:24', 'read'),
      m('them', 'Pode ser sábado de manhã!', '10:26', null),
    ],
  },
  {
    id: 'patricia', name: 'Patrícia Gomes', initials: 'PG', av: AV.patricia,
    stage: 'Novo', quente: false, novo: true, sla: null,
    lastTime: '14:11', unread: 1, windowHrs: 22,
    budget: 'Até R$ 420 mil', finalidade: 'Moradia', qualify: null,
    property: { title: 'Casa · Janga', area: '120 m²', price: 'R$ 390.000', code: '51344', specs: '3 quartos · quintal' },
    handoff: {
      time: 'Hoje · 14:00', botQualify: 'Lead novo', urgencia: 'Média · pesquisando',
      resumo: 'Primeiro contato pela casa do Janga. Demonstrou interesse e perguntou sobre disponibilidade.',
      fields: [
        ['building-2', 'Imóvel', 'Casa · Janga · Cód 51344'],
        ['wallet', 'Orçamento', 'Até R$ 420 mil'],
        ['target', 'Finalidade', 'Moradia'],
        ['credit-card', 'Pagamento', 'A confirmar'],
      ],
    },
    timeline: [
      { t: 'Pré-atendimento pelo Assistente', d: 'Hoje · 13:56', icon: 'bot' },
      { t: 'Transferido para você', d: 'Hoje · 14:00', icon: 'arrow-right-left' },
      { t: 'Número do cliente ocultado', d: 'Hoje · 14:09', icon: 'shield-check', accent: true },
    ],
    messages: [
      m('them', 'Oi! Tenho interesse na casa do Janga, ainda está disponível?', '14:05', null),
      m('me', 'Oi, Patrícia! Está sim. Posso te mostrar fotos e condições por aqui.', '14:07', 'read'),
      { from: 'them', kind: 'masked', text: 'Que bom! Meu número é {num}, pode me chamar lá também.', time: '14:09' },
      { from: 'me', kind: 'auto', text: 'Não precisa enviar seu número. Para mais agilidade e para mantermos a qualidade do atendimento, toda a conversa acontece por este canal.', time: '14:09' },
      m('them', 'Ah, entendi! Então me conta mais sobre a casa, por favor.', '14:11', null),
    ],
  },
  {
    id: 'fernanda', name: 'Fernanda Lima', initials: 'FL', av: AV.fernanda,
    stage: 'Em atendimento', quente: false, novo: false, sla: '3h',
    lastTime: '08:50', unread: 1, windowHrs: 8,
    budget: 'Até R$ 580 mil', finalidade: 'Investimento', qualify: 'Morno',
    property: { title: 'Apto 2 quartos · Pina', area: '68 m²', price: 'R$ 540.000', code: '49802', specs: '2 quartos · 1 vaga' },
    handoff: {
      time: 'Hoje · 08:10', botQualify: 'Morno', urgencia: 'Alta · quer fechar rápido',
      resumo: 'Investidora. Pretende financiar o apto do Pina usando FGTS e pediu agilidade na documentação. Já conhece a região.',
      fields: [
        ['building-2', 'Imóvel', 'Apto 2q · Pina · Cód 49802'],
        ['wallet', 'Orçamento', 'Até R$ 580 mil'],
        ['target', 'Finalidade', 'Investimento'],
        ['credit-card', 'Pagamento', 'Financiamento + FGTS'],
      ],
    },
    timeline: [
      { t: 'Pré-atendimento pelo Assistente', d: 'Hoje · 08:05', icon: 'bot' },
      { t: 'Transferido para você', d: 'Hoje · 08:10', icon: 'arrow-right-left' },
      { t: '1ª resposta em 6 min', d: 'Hoje · 08:18', icon: 'zap' },
      { t: 'Aguardando há 3h', d: 'SLA estourado', icon: 'alarm-clock', warn: true },
    ],
    messages: [
      m('them', 'Bom dia! O apto do Pina aceita financiamento?', '08:44', null),
      m('me', 'Bom dia, Fernanda! Aceita sim, inclusive com FGTS.', '08:48', 'read'),
      m('them', 'E a documentação, já está toda certa? Queria fechar rápido.', '08:50', null),
    ],
  },
  {
    id: 'carlos', name: 'Carlos Eduardo', initials: 'CE', av: AV.carlos,
    stage: 'Negociação', quente: true, novo: false, sla: null,
    lastTime: '10:15', unread: 1, windowHrs: 2,
    budget: 'Até R$ 1,4 mi', finalidade: 'Moradia', qualify: 'Quente',
    property: { title: 'Cobertura · Boa Viagem', area: '224 m²', price: 'R$ 1.450.000', code: '47710', specs: '4 suítes · 3 vagas' },
    handoff: {
      time: 'Há 6 dias', botQualify: 'Quente', urgencia: 'Alta · em negociação',
      resumo: 'Já visitou a cobertura e gostou. Proposta enviada; está negociando o valor final e sinalizou contraproposta de R$ 1.380.000.',
      fields: [
        ['building-2', 'Imóvel', 'Cobertura · Boa Viagem · Cód 47710'],
        ['wallet', 'Orçamento', 'Até R$ 1,4 mi'],
        ['target', 'Finalidade', 'Moradia'],
        ['credit-card', 'Pagamento', 'À vista · negociando'],
      ],
    },
    timeline: [
      { t: 'Pré-atendimento pelo Assistente', d: 'Há 6 dias', icon: 'bot' },
      { t: 'Visita realizada', d: 'Há 2 dias', icon: 'map-pin' },
      { t: 'Proposta enviada', d: 'Ontem · 17:20', icon: 'file-text' },
      { t: 'Em negociação', d: 'Hoje · 10:15', icon: 'handshake', accent: true },
    ],
    messages: [
      m('me', 'Carlos, enviei a proposta da cobertura. Qualquer dúvida estou à disposição.', 'Ontem 17:20', 'read'),
      m('them', 'Gostei muito do imóvel. Consigo fechar em R$ 1.380.000?', '10:15', null),
    ],
  },
  {
    id: 'beatriz', name: 'Beatriz Souza', initials: 'BS', av: AV.beatriz,
    stage: 'Proposta', quente: false, novo: false, sla: null,
    lastTime: 'Ontem', unread: 0, windowHrs: null,
    budget: 'Até R$ 750 mil', finalidade: 'Moradia', qualify: 'Morno',
    property: { title: 'Apto · Casa Forte', area: '95 m²', price: 'R$ 720.000', code: '48655', specs: '3 quartos · 2 vagas' },
    handoff: {
      time: 'Há 4 dias', botQualify: 'Morno', urgencia: 'Média · decidindo',
      resumo: 'Visitou o apto de Casa Forte e recebeu proposta com validade de 3 dias. Vai decidir junto com o marido antes de responder.',
      fields: [
        ['building-2', 'Imóvel', 'Apto 3q · Casa Forte · Cód 48655'],
        ['wallet', 'Orçamento', 'Até R$ 750 mil'],
        ['target', 'Finalidade', 'Moradia'],
        ['credit-card', 'Pagamento', 'Financiamento'],
      ],
    },
    timeline: [
      { t: 'Pré-atendimento pelo Assistente', d: 'Há 4 dias', icon: 'bot' },
      { t: 'Visita realizada', d: 'Há 2 dias', icon: 'map-pin' },
      { t: 'Proposta enviada', d: 'Ontem · 16:05', icon: 'file-text', accent: true },
    ],
    messages: [
      m('me', 'Beatriz, segue a proposta do apto de Casa Forte. Validade de 3 dias.', 'Ontem 16:05', 'read'),
      m('them', 'Recebi, obrigada! Vou conversar com meu marido e te retorno.', 'Ontem 16:40', null),
    ],
  },
];

export const TEMPLATES: any[] = [
  { label: 'Saudação', text: `Olá! Aqui é o Ricardo, da ${demo.nome}. Recebi seu contato e já estou com os detalhes do imóvel. Como posso te ajudar?` },
  { label: 'Disponível', text: 'Sim, o imóvel está disponível! Quer que eu te envie mais fotos e detalhes?' },
  { label: 'Agendar visita', text: 'Posso agendar uma visita pra você. Qual o melhor dia e horário?' },
  { label: 'Documentação', text: 'A documentação está toda regularizada e o imóvel aceita financiamento.' },
  { label: 'Follow-up', text: 'Oi! Passando pra saber se ficou alguma dúvida sobre o imóvel. Fico à disposição.' },
];

export const MEETINGS: Record<string, any[]> = {
  mariana: [
    {
      id: 'mtg-mc-1', title: 'Apresentação do imóvel e condições', status: 'realizada',
      date: 'Ontem', time: '16:00', dur: '28 min',
      meetLink: 'meet.google.com/ds-mria-vis',
      recordingUrl: '#',
      participants: [
        { name: 'Ricardo Almeida', role: 'Corretor', initials: 'RA', me: true },
        { name: 'Mariana Costa', role: 'Cliente', initials: 'MC', me: false },
      ],
      summary: 'A cliente demonstrou forte interesse no apartamento, gostou especialmente da varanda e da vista. Tem dúvidas sobre financiamento e precisa de uma vaga de garagem extra. Quer agendar uma visita presencial.',
      pontos: [
        'Faixa de preço confortável: R$ 850–900 mil',
        'Precisa de 2 vagas de garagem',
        'Pretende mudar em até 3 meses',
        'Pediu simulação de financiamento',
      ],
      proximos: [
        { t: 'Enviar simulação de financiamento', action: 'Criar tarefa', icon: 'file-text', kind: 'tarefa' },
        { t: 'Agendar visita para sábado de manhã', action: 'Agendar visita', icon: 'calendar-plus', kind: 'visita' },
        { t: 'Confirmar vaga extra com o proprietário', action: 'Criar tarefa', icon: 'square-check', kind: 'tarefa' },
      ],
      transcript: [
        { time: '16:02', who: 'Ricardo', me: true, text: 'Esse apartamento tem 110m², três quartos sendo uma suíte, e a varanda integrada que você comentou que gosta.' },
        { time: '16:09', who: 'Mariana', me: false, text: 'Adorei a varanda. E sobre a garagem, tem como conseguir uma segunda vaga?' },
        { time: '16:15', who: 'Ricardo', me: true, text: 'Consigo verificar com o proprietário e te retorno ainda hoje.' },
        { time: '16:22', who: 'Mariana', me: false, text: 'Perfeito. Quero muito ver pessoalmente, podia ser no sábado de manhã?' },
      ],
    },
  ],
};

export function nowTime(): string {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export function cloneDeep<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}
