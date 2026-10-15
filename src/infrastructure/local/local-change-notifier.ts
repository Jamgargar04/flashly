/** Avisa a los suscriptores del modo demostración cuando cambian los datos locales (simula el tiempo real). */
export class LocalChangeNotifier {
  private readonly listeners = new Set<() => void>();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
