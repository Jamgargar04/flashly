/** Evento del campus publicado por administradores. */
export type CampusEvent = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  when: string;        // Cadena de visualización: "Jueves, 13:00"
  location?: string;   // Lugar del campus donde ocurre
};
