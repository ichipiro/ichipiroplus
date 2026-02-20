// biome-ignore lint/complexity/noBannedTypes: legacy reason
export function debounce<T extends Function>(func: T, wait: number) {
  let h: NodeJS.Timeout;

  // biome-ignore lint/suspicious/noExplicitAny: legacy reason
  const callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => func(...args), wait);
  };

  // biome-ignore lint/suspicious/noExplicitAny: legacy reason
  return <T>(<any>callable);
}
