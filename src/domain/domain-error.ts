/** Error de negocio con un mensaje listo para mostrar al usuario. */
export class DomainError extends Error {
  constructor(message: string, readonly code: string = 'domain') {
    super(message);
    this.name = 'DomainError';
  }
}

export const messageOf = (error: unknown, fallback = 'Algo salió mal. Intenta de nuevo.'): string =>
  error instanceof Error && error.message ? error.message : fallback;
