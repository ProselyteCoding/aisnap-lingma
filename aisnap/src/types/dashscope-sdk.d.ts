declare module '@dashscope/sdk' {
  export class DashScope {
    constructor(options: { apiKey: string });
    
    multimodalConversation: {
      call(options: {
        model: string;
        input: {
          messages: Array<{
            role: string;
            content: Array<{
              text?: string;
              image?: string;
            }>;
          }>;
        };
        parameters?: {
          seed?: number;
        };
      }): Promise<{
        output: {
          choices: Array<{
            message: {
              content: Array<{
                text?: string;
              }>;
            };
          }>;
        };
      }>;
    };
    
    textGeneration: {
      call(options: {
        model: string;
        input: {
          prompt: string;
        };
      }): Promise<{
        output: {
          text: string;
        };
      }>;
    };
  }
}