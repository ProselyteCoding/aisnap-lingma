declare module 'node-pandoc' {
  type Callback = (err: Error | null, result: string | boolean) => void;
  
  interface Pandoc {
    (src: string, args: string, callback: Callback): void;
  }

  const pandoc: Pandoc;
  export default pandoc;
}