import type { ReportInput, ReportRepository } from '@/domain/ports';

/** En modo demostración no hay a quién enviar el reporte: se acepta y se descarta. */
export class LocalReportRepository implements ReportRepository {
  async report(_input: ReportInput): Promise<void> {
    return undefined;
  }
}
