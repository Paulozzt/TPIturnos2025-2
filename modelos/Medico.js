export class Medico{
    constructor(nombre,especialidad,avatar=null,disponibilidad=[]){
        this.nombre = nombre;
        this.especialidad= especialidad;
        this.avatar = avatar || `https://ui-avatars.com/api/?name=${nombre}&background=random`;
        this.disponibilidad = disponibilidad
    }

    

}