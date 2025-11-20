export class Usuario {
    constructor(nombre, email, password, role = "Paciente", avatarBase64 = null) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.role = role; 
        
        this.avatar = avatarBase64 || `https://ui-avatars.com/api/?name=${nombre}&background=random&color=fff`;
    }
}

