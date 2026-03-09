export enum ROW_STATUS {
  IMPORTED = 'IMPORTADO', // Linha recém importada da planilha
  IN_PROGRESS = 'EM_ANALISE', // Advogado trabalhando
  VALIDATED = 'VALIDADO', // Caso revisado / confirmado
  COMPLETED = 'CONCLUIDO', // Trabalho finalizado
  REJECTED = 'DESCARTADO', // Caso inválido / não será usado
}