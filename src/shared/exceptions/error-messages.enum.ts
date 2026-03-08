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
  ERROR_EXECUTING_QUERY: (query: string) => {
    return {
      code: 2,
      message: `Houve um erro ao executar a seguinte query ${query}`,
    };
  },
};
