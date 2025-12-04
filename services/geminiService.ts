import { GoogleGenAI } from "@google/genai";
import { Member } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSocioEconomicProfile = async (member: Member): Promise<string> => {
  try {
    const childrenInfo = member.children && member.children.length > 0 
      ? member.children.map(c => `${c.name} (${c.age} anos)`).join(', ')
      : 'Sem filhos cadastrados';

    const churchInfo = member.churchName 
      ? `Participa da igreja ${member.churchName}` 
      : 'Sem informações eclesiásticas';

    const assistanceInfo = member.assistanceHistory && member.assistanceHistory.length > 0
      ? member.assistanceHistory.map(a => `${a.description} (${a.endDate ? 'Concluída' : 'EM ANDAMENTO'})`).join('; ')
      : 'Nenhum histórico de ajuda';

    const statusLabel = member.status === 'active_paying' ? 'Ativo (Pagante)' : 
                        member.status === 'active_exempt' ? 'Ativo (Dispensado)' : 
                        `Inativo (Motivo: ${member.inactiveReason})`;

    const conquestLabel = member.topNumber ? `TOP ${member.topNumber} (Pista: ${member.trackName || 'N/A'}, Data: ${member.conquestDate || 'N/A'})` : 'Sem dados de TOP';

    const prompt = `
      Analise o seguinte perfil de membro do grupo "Legendários" para fins socioeconômicos e de networking.
      
      Dados:
      Nome: ${member.fullName}
      Número Legendário: ${member.legendaryNumber}
      Dados da Conquista: ${conquestLabel}
      Status no Grupo: ${statusLabel}
      Profissão: ${member.profession}
      Endereço: ${member.address}, ${member.neighborhood || ''} - ${member.city} / ${member.state || ''}
      Idade: ${new Date().getFullYear() - new Date(member.birthDate).getFullYear()} anos
      Família: Casado com ${member.spouseName || 'N/A'}. Filhos: ${childrenInfo}.
      Comunidade: ${churchInfo}. Membro Ativo na Comunidade: ${member.isCommunityActive ? 'Sim' : 'Não'}.
      
      Histórico de Assistência/Ajuda Recebida: ${assistanceInfo}
      
      Notas: ${member.socioEconomicNotes || "Nenhuma nota adicional."}

      Por favor, forneça:
      1. Um resumo curto do perfil socioeconômico estimado e estrutura familiar.
      2. Como este membro pode contribuir para o ecossistema do grupo (baseado na profissão e antiguidade/TOP).
      3. Sugestões de suporte que ele pode precisar baseadas no perfil familiar, status (ex: se for inativo ou dispensado) e histórico de ajuda.
      
      Mantenha o tom profissional, respeitoso e focado em ajuda mútua. Responda em texto corrido formatado com Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Error analyzing profile:", error);
    return "Erro ao conectar com a Inteligência Artificial.";
  }
};