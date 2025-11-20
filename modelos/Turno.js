export class Turno {
    constructor(patientId, doctorId, fecha, hora, estado = "en_espera") {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.fecha = fecha;
        this.hora = hora;
        // estado posible de los turno 'en_espera', 'finalizado', 'cancelado', 'no_asistio'
        this.estado = estado; 
    }
}

