export interface Viaje {
    id?: string;
    destino: string;
    horaSalida: string;
    pasajerosMaximos: number;
    pasajerosActuales: number;
    tarifa: number;
    fecha: Date;
    patente: string;
    conductor: string;
    email: string;
    suscriptores: string[] | null;
    
}


export interface UsuarioDatos {
    patente: string;
    email:string;
    firstname: string; // Asegúrate de que los nombres y tipos sean correctos
    // Incluye aquí otras propiedades que esperas que tenga el usuario
  }