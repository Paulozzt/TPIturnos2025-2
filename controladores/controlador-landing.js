import { listarMedicos } from '../servicios/servicios-medicos.js';

document.addEventListener('DOMContentLoaded', async () => {
    verificarSesion();
    await cargarMedicosEnLanding();
});

function verificarSesion() {
    const usuarioGuardado = sessionStorage.getItem('usuario');
    const contenedorLogin = document.querySelector('.log-in');

    if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        contenedorLogin.innerHTML = `
            <a href="usuario-perfil-index.html" class="login-link" style="color: #001b48; font-weight: bold;">
                <i class="fa-solid fa-user"></i>
                <span>Hola, ${usuario.nombre.split(' ')[0]}</span>
            </a>
            <a href="#" class="login-link" onclick="cerrarSesionLanding(event)" title="Cerrar Sesión">
                <i class="fa-solid fa-right-from-bracket"></i>
            </a>
        `;
    } else {
        contenedorLogin.innerHTML = `
            <a href="login-index.html" class="login-link">
                <i class="fa-solid fa-right-to-bracket"></i>
                <span>Log in</span>
            </a>
            <a href="registro.html" class="login-link">
                <i class="fa-solid fa-user-plus"></i>
                <span>Sign up</span>
            </a>
        `;
    }
}


window.cerrarSesionLanding = (e) => {
    e.preventDefault();
    if(confirm("¿Deseas cerrar sesión?")) {
        sessionStorage.clear();
        window.location.reload();
    }
}

async function cargarMedicosEnLanding() {
    const contenedor = document.querySelector('.listado-medicos');
    contenedor.innerHTML = '<p style="text-align:center; width:100%">Cargando especialistas...</p>';

    try {
        const medicos = await listarMedicos(); 
        contenedor.innerHTML = ''; 
        if (!medicos || medicos.length === 0) {
            contenedor.innerHTML = '<p>No hay médicos disponibles.</p>';
            return;
        }

        medicos.forEach(medico => {
            const card = document.createElement('div');
            card.className = 'card-medicos';

            const avatarUrl = medico.avatar || '/assets/img/result_Avatar3d.png';
            let diasHtml = '';
            if (medico.disponibilidad && medico.disponibilidad.length > 0) {
                medico.disponibilidad.forEach(item => {
                    const nombreDia = item.dia.substring(0, 3);
                    diasHtml += `<li>${nombreDia}</li>`;
                });
            } else {
                diasHtml = '<li>Sin horarios</li>';
        }

            card.innerHTML = `
                <div class="foto-perfil-doctor">
                    <img src="${avatarUrl}" class="perfil-doctor" alt="${medico.nombre}">
                </div>
                <div class="info-doctor">
                    <h3 class="nombre">${medico.nombre}</h3>
                    <p class="especialidad">${medico.especialidad}</p>
                </div>

                <div class="disponibilidad">
                    <ul class="dias-disponibles">
                        ${diasHtml} </ul>
                </div>
                
                <a class="agendar-cita-indvidual" href="#" onclick="intentarReservar(event, '${medico.id}')">
                    Agenda una cita
                </a>
            `;
            
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando médicos:", error);
        contenedor.innerHTML = '<p>Hubo un error al cargar los datos.</p>';
    }
}

window.intentarReservar = (e, idMedico) => {
    e.preventDefault(); 

    const usuario = sessionStorage.getItem('usuario');

    if (usuario) {
        console.log(`Iniciando reserva con médico ID: ${idMedico}`);
        window.location.href = `reservar-turno.html?id=${idMedico}`

    } else {
        window.location.href = 'login-index.html';
    }
}