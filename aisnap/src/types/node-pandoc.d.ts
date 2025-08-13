declare module 'node-pandoc' {
  type Callback = (err: Error | null, result: string) => void;
  
  interface Pandoc {
    (args: string[], callback: Callback): void;
  }

  const pandoc: Pandoc;
  export default pandoc;
}