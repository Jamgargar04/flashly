import { DomainError } from '@/domain/domain-error';
import { completeEmail, isInstitutionalEmail, isTeacherEmail, parseOrThrow, signInSchema, signUpSchema } from '@/domain/student';

describe('validación del estudiante', () => {
  it('acepta el correo institucional y lo normaliza', () => {
    const input = parseOrThrow(signInSchema, { email: '  DSM123.X@Alumnos.UTSV.edu.mx ', password: '12345678' });
    expect(input.email).toBe('dsm123.x@alumnos.utsv.edu.mx');
  });

  it('rechaza correos que no son institucionales', () => {
    expect(() => parseOrThrow(signInSchema, { email: 'alguien@gmail.com', password: '12345678' })).toThrow('Usa tu correo institucional');
    expect(isInstitutionalEmail('alguien@outlook.com')).toBe(false);
    expect(isInstitutionalEmail('profe@utsv.edu.mx')).toBe(true);
  });

  it('exige contraseñas de al menos 8 caracteres', () => {
    expect(() => parseOrThrow(signInSchema, { email: 'a@alumnos.utsv.edu.mx', password: '1234' })).toThrow('al menos 8');
  });

  it('exige el nombre completo al registrarse', () => {
    const input = { email: 'a@alumnos.utsv.edu.mx', password: '12345678', name: 'Al', group: '10-A' };
    expect(() => parseOrThrow(signUpSchema, input)).toThrow('Escribe tu nombre completo.');
  });

  it('lanza un DomainError con el campo en el código (para traducir el mensaje)', () => {
    expect.assertions(2);
    try {
      parseOrThrow(signInSchema, { email: 'x', password: '' });
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe('validation/email');
    }
  });

  it('completa el dominio institucional a partir de la matrícula', () => {
    expect(completeEmail('DSM123')).toEqual(['dsm123@alumnos.utsv.edu.mx', 'dsm123@utsv.edu.mx']);
    expect(completeEmail('profe@utsv')).toEqual(['profe@utsv.edu.mx']);
    expect(completeEmail('ana@alumnos.utsv.edu.mx')).toEqual([]);
    expect(completeEmail('con espacio')).toEqual([]);
  });

  it('reconoce los correos de maestros', () => {
    expect(isTeacherEmail('profe@utsv.edu.mx')).toBe(true);
    expect(isTeacherEmail('ana@alumnos.utsv.edu.mx')).toBe(false);
  });
});
