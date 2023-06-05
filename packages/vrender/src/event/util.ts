export const clock = typeof performance === 'object' && (performance as any).now ? performance : Date;
