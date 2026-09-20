"use client";
/**
 * Modal da avaliação: formulário → envio → agradecimento.
 *
 * A moldura é a mesma do fluxo de acesso (`ModalAcesso`): fundo escurecido,
 * `aria-modal`, título que rotula o diálogo e Esc para fechar. O que falta para
 * o padrão de diálogo (foco no primeiro controle, Tab preso dentro e foco
 * devolvido ao fechar) entra pelo `useFocoModal`.
 *
 * O empilhamento também é daqui: a moldura do acesso vive em `z-index: 200`, e o
 * botão Guia e o painel do guia, em 250. Sem o `z-index` próprio deste invólucro,
 * o formulário abriria POR BAIXO do guia.
 *
 * É o único ponto que fala com a API da avaliação — o formulário só desenha.
 */
import * as React from "react";
import ModalAcesso from "@/components/acesso/ModalAcesso";
import { enviarAvaliacao, type Resumo } from "./api";
import FormAvaliacao, { type DadosForm } from "./FormAvaliacao";
import Agradecimento from "./Agradecimento";
import { marcarRespondido } from "./estado";
import { useFocoModal } from "./useFocoModal";

/** Acima do guia (250) e das boas-vindas (300), abaixo do tour (400). */
const CAMADA = 310;

const SEM_NOTA = "escolha uma nota de 1 a 5 estrelas antes de enviar.";
const SEM_ESCOLHA = "escolha como você quer aparecer no site antes de enviar.";

/** Nada marcado de fábrica: a nota e o consentimento são escolha explícita da pessoa. */
const INICIAL: DadosForm = { estrelas: 0, comentario: "", identificacao: null };

type Fase =
  | { tela: "form" }
  | { tela: "enviando" }
  | { tela: "obrigado"; resumo: Resumo | null; pendente: boolean };

export default function ModalAvaliacao({ aoFechar }: { aoFechar: () => void }) {
  const [dados, setDados] = React.useState<DadosForm>(INICIAL);
  const [fase, setFase] = React.useState<Fase>({ tela: "form" });
  const [erro, setErro] = React.useState<string | undefined>();
  const [aviso, setAviso] = React.useState<string | undefined>();
  /** 401: o erro vem com o caminho de volta (entrar de novo), não só com o texto. */
  const [semAcesso, setSemAcesso] = React.useState(false);
  const caixa = React.useRef<HTMLDivElement>(null);
  useFocoModal(caixa);

  const mudar = React.useCallback((novos: Partial<DadosForm>) => {
    setDados((d) => ({ ...d, ...novos }));
    setErro(undefined); // mexeu no formulário: o erro anterior sai da frente
    setSemAcesso(false);
    // trocou a identificação: o aviso do 409 ("caiu para anônimo") não vale mais
    if (novos.identificacao !== undefined) setAviso(undefined);
  }, []);

  const enviar = React.useCallback(async () => {
    if (dados.estrelas === 0) {
      setErro(SEM_NOTA);
      return;
    }
    const identificacao = dados.identificacao;
    if (identificacao === null) {
      setErro(SEM_ESCOLHA);
      return;
    }
    setFase({ tela: "enviando" });
    setErro(undefined);
    setSemAcesso(false);
    const r = await enviarAvaliacao({ ...dados, identificacao });

    if (r.status === "publicado" || r.status === "pendente") {
      marcarRespondido(); // o convite não volta mais para quem já avaliou
      setFase({ tela: "obrigado", resumo: r.resumo, pendente: r.status === "pendente" });
      return;
    }

    setFase({ tela: "form" });
    if (r.status === "sem_nome") {
      // 409: o cadastro é antigo e não tem nome — a escolha cai para anônimo e avisa
      setDados((d) => ({ ...d, identificacao: "anonimo" }));
      setAviso(r.mensagem);
      return;
    }
    setAviso(undefined);
    setSemAcesso(r.status === "sem_acesso"); // dá a saída certa: entrar de novo
    setErro(r.mensagem);
  }, [dados]);

  const pronto = fase.tela === "obrigado";

  return (
    <div ref={caixa} style={{ position: "relative", zIndex: CAMADA }}>
      <ModalAcesso titulo={pronto ? "Obrigado pela nota!" : "Avaliar a demonstração"} etapa="" aoFechar={aoFechar}>
        {fase.tela === "obrigado" ? (
          <Agradecimento resumo={fase.resumo} pendente={fase.pendente} aoFechar={aoFechar} />
        ) : (
          <FormAvaliacao
            dados={dados}
            aoMudar={mudar}
            aoEnviar={enviar}
            enviando={fase.tela === "enviando"}
            erro={erro}
            aviso={aviso}
            semAcesso={semAcesso}
          />
        )}
      </ModalAcesso>
    </div>
  );
}
