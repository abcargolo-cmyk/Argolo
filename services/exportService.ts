import { Member, MemberStatus, MONTHS } from '../types';

// Helper to download text as file
const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const getStatusLabel = (status: MemberStatus) => {
    switch (status) {
        case 'active_paying': return 'Ativo (Pagante)';
        case 'active_exempt': return 'Ativo (Dispensado)';
        case 'inactive': return 'Inativo';
        default: return status;
    }
};

export const exportToCSV = (members: Member[]) => {
  const headers = [
    'Nº Legendário', 
    'TOP',
    'Pista Conquista',
    'Data Conquista',
    'Nome', 
    'Status',
    'Motivo Inatividade',
    'Profissão', 
    'Bairro',
    'Cidade', 
    'Estado',
    'Telefone', 
    'Email',
    'Telefone Esposa', 
    'Data Nasc.', 
    'Comunidade Ativo', 
    'Igreja', 
    'Pastor', 
    'Tel. Pastor',
    'Filhos (Qtd)',
    'Nomes Filhos',
    'Histórico de Ajuda'
  ];
  
  const rows = members.map(m => {
    const assistanceStr = m.assistanceHistory 
        ? m.assistanceHistory.map(a => `${a.description} (${a.startDate} - ${a.endDate || 'Atual'})`).join(' | ')
        : '';

    return [
        m.legendaryNumber,
        m.topNumber || '',
        `"${m.trackName || ''}"`,
        m.conquestDate || '',
        `"${m.fullName}"`,
        getStatusLabel(m.status),
        `"${m.inactiveReason || ''}"`,
        `"${m.profession}"`,
        `"${m.neighborhood || ''}"`,
        `"${m.city}"`,
        `"${m.state || ''}"`,
        m.phone,
        m.email || '',
        m.spousePhone || '',
        m.birthDate,
        m.isCommunityActive ? 'Sim' : 'Não',
        `"${m.churchName || ''}"`,
        `"${m.pastorName || ''}"`,
        m.pastorPhone || '',
        m.children ? m.children.length : 0,
        `"${m.children ? m.children.map(c => `${c.name} (${c.age})`).join('; ') : ''}"`,
        `"${assistanceStr}"`
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, 'legendarios_export.csv', 'text/csv;charset=utf-8;');
};

export const exportToWord = (members: Member[]) => {
  // Creating a simple HTML compatible with Word
  let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Relatório Legendários</title></head>
    <body>
    <h1>Relatório de Membros - Legendários</h1>
    <table border="1" style="border-collapse: collapse; width: 100%; font-size: 12px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th>Nº / Conquista</th>
          <th>Nome / Status</th>
          <th>Profissão</th>
          <th>Contato / Endereço</th>
          <th>Familia</th>
          <th>Igreja</th>
          <th>Asssitência / Ajuda</th>
        </tr>
      </thead>
      <tbody>
  `;

  members.forEach(m => {
    const childrenStr = m.children && m.children.length > 0 
        ? `<br/>Filhos: ${m.children.map(c => `${c.name} (${c.age})`).join(', ')}` 
        : '';

    const assistanceStr = m.assistanceHistory && m.assistanceHistory.length > 0
        ? `<ul style="margin:0; padding-left:15px;">${m.assistanceHistory.map(a => `<li>${a.description} (${a.endDate ? 'Encerrado' : '<b>Vigente</b>'})</li>`).join('')}</ul>`
        : 'Nenhuma';
    
    const conquestInfo = m.topNumber || m.trackName 
        ? `<br/><small>TOP: ${m.topNumber || '-'} | Pista: ${m.trackName || '-'}<br/>Data: ${m.conquestDate || '-'}</small>` 
        : '';
        
    html += `
      <tr>
        <td>
            <b>${m.legendaryNumber}</b>
            ${conquestInfo}
        </td>
        <td>
            <b>${m.fullName}</b><br/>
            ${getStatusLabel(m.status)}
            ${m.status === 'inactive' && m.inactiveReason ? `<br/><i>Motivo: ${m.inactiveReason}</i>` : ''}
            <br/>${m.isCommunityActive ? '(Comunidade Ativa)' : '(Comunidade Inativa)'}
        </td>
        <td>${m.profession}</td>
        <td>
            ${m.phone}<br/>
            ${m.email ? `Email: ${m.email}<br/>` : ''}
            ${m.address}<br/>
            ${m.neighborhood ? `Bairro: ${m.neighborhood}<br/>` : ''}
            ${m.city} ${m.state ? `- ${m.state}` : ''}
        </td>
        <td>
            Esposa: ${m.spouseName || '-'}<br/>
            Tel Esposa: ${m.spousePhone || '-'}
            ${childrenStr}
        </td>
        <td>
            ${m.churchName || '-'}<br/>
            Pr. ${m.pastorName || '-'} (${m.pastorPhone || '-'})
        </td>
        <td>${assistanceStr}</td>
      </tr>
    `;
  });

  html += `</tbody></table></body></html>`;

  downloadFile(html, 'legendarios_relatorio.doc', 'application/msword');
};

// --- Financial Reports ---

interface LedgerItem {
    date: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    amount: number;
}

export const exportFinancialReportToCSV = (month: number, year: number, transactions: LedgerItem[]) => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const rows = transactions.map(t => [
        t.date,
        `"${t.description}"`,
        `"${t.category}"`,
        t.type === 'income' ? 'Entrada' : 'Saída',
        t.amount.toFixed(2).replace('.', ',')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `financeiro_legendarios_${month}_${year}.csv`, 'text/csv;charset=utf-8;');
};

export const exportFinancialReportToWord = (month: number, year: number, transactions: LedgerItem[]) => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const monthName = MONTHS[month - 1];

    let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>Relatório Financeiro</title>
        <style>
            body { font-family: 'Arial', sans-serif; font-size: 12pt; }
            h1 { text-align: center; color: #1e3a8a; margin-bottom: 5px; }
            h2 { text-align: center; color: #4b5563; font-size: 14pt; margin-top: 0; }
            .summary-box { border: 1px solid #000; padding: 15px; margin: 20px 0; background-color: #f8fafc; }
            .summary-table { width: 100%; text-align: center; }
            .summary-value { font-size: 16pt; font-weight: bold; }
            .green { color: #166534; }
            .red { color: #991b1b; }
            .blue { color: #1e40af; }
            table.details { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10pt; }
            table.details th { background-color: #1e3a8a; color: white; padding: 8px; text-align: left; }
            table.details td { border-bottom: 1px solid #ddd; padding: 6px; }
            table.details tr:nth-child(even) { background-color: #f3f4f6; }
            .footer { margin-top: 50px; width: 100%; text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 40%; display: inline-block; margin: 0 20px; padding-top: 5px; }
        </style>
    </head>
    <body>
        <h1>SISTEMA LEGENDÁRIOS</h1>
        <h2>Relatório Financeiro Mensal - ${monthName}/${year}</h2>

        <div class="summary-box">
            <table class="summary-table">
                <tr>
                    <td>TOTAL ENTRADAS</td>
                    <td>TOTAL SAÍDAS</td>
                    <td>SALDO DO PERÍODO</td>
                </tr>
                <tr>
                    <td class="summary-value green">R$ ${totalIncome.toFixed(2).replace('.', ',')}</td>
                    <td class="summary-value red">R$ ${totalExpense.toFixed(2).replace('.', ',')}</td>
                    <td class="summary-value blue">R$ ${balance.toFixed(2).replace('.', ',')}</td>
                </tr>
            </table>
        </div>

        <h3>Detalhamento das Transações</h3>
        <table class="details">
            <thead>
                <tr>
                    <th width="15%">Data</th>
                    <th width="45%">Descrição</th>
                    <th width="20%">Categoria</th>
                    <th width="20%" style="text-align:right;">Valor (R$)</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Sort by date descending
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(t => {
        const color = t.type === 'income' ? '#166534' : '#991b1b';
        const sign = t.type === 'expense' ? '-' : '+';
        html += `
            <tr>
                <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td style="text-align:right; color: ${color}; font-weight:bold;">
                    ${sign} ${t.amount.toFixed(2).replace('.', ',')}
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <div class="footer">
            <br/><br/><br/>
            <div>
                <div class="signature-line">Presidente</div>
                <div class="signature-line">Tesoureiro</div>
            </div>
            <p style="font-size: 9pt; color: #888; margin-top: 20px;">
                Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </p>
        </div>
    </body>
    </html>
    `;

    downloadFile(html, `Relatorio_Financeiro_${monthName}_${year}.doc`, 'application/msword');
};

export const printToPDF = () => {
  window.print();
};