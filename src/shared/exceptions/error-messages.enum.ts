export type ErrorMessage = {
  code: number;
  message: string;
};

export type APIErrorMessage = ErrorMessage & {
  status: number;
  error: string;
};

export const ERROR_MESSAGES = {
  SPREADSHEET_NOT_FOUND: {
    code: 1,
    message: 'Não foi encontrada nenhuma planilha com o código informado.',
  },
  SPREADSHEET_EXTENSION_NOT_SUPPORTED: {
    code: 2,
    message: 'A extensão do arquivo da planilha não é suportada.',
  },
  CLIENT_NOT_FOUND: {
    code: 4,
    message: 'Não foi encontrado nenhum cliente com o código informado.',
  },
  TEAM_NOT_FOUND: {
    code: 5,
    message: 'Não foi encontrado nenhum time com o código informado.',
  },
  ERROR_EXECUTING_QUERY: (query: string) => {
    return {
      code: 3,
      message: `Houve um erro ao executar a seguinte query ${query}`,
    };
  },
};
