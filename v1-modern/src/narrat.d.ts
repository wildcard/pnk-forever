declare module '*.narrat' {
  const script: {
    code: string;
    fileName: string;
    id: string;
    type: 'script';
  };
  export default script;
}
