import { obtenerMedico } from '../servicios/servicios-medicos.js';
import { listarTurnos, crearTurno } from '../servicios/servicios-turnos.js';

let medicoActual = null;
let horaSeleccionada = null;

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login-index.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const idMedico = params.get('id');

    if (!idMedico) {
        alert("No se seleccionó ningún médico");
        window.location.href = 'landing-index.html';
        return;
    }

    await cargarDatosMedico(idMedico);
    document.getElementById('input-fecha').addEventListener('change', procesarFecha);
    document.getElementById('btn-confirmar-reserva').addEventListener('click', confirmarReserva);
});

async function cargarDatosMedico(id) {
    medicoActual = await obtenerMedico(id);
    
    if (!medicoActual) {
        alert("El médico no existe.");
        window.location.href = 'landing-index.html';
        return;
    }

    document.getElementById('nombre-medico').innerText = medicoActual.nombre;
    document.getElementById('especialidad-medico').innerText = medicoActual.especialidad;
    document.getElementById('id-medico').innerText = medicoActual.id;
    
    const avatarUrl = medicoActual.avatar || 'assets/img/result_Avatar3d.png';
    document.getElementById('img-medico').src = avatarUrl;

    const contenedorDias = document.getElementById('dias-atencion');
    contenedorDias.innerHTML = ''; 
    if (medicoActual.disponibilidad) {
        medicoActual.disponibilidad.forEach(d => {
            contenedorDias.innerHTML += `<span class="badge">${d.dia.substring(0,3)}</span>`;
        });
    }
}

async function procesarFecha(e) {
    const fechaSeleccionada = e.target.value;
    const contenedorHorarios = document.getElementById('contenedor-horarios');
    const feedback = document.getElementById('feedback-fecha');
    const btnConfirmar = document.getElementById('btn-confirmar-reserva');

    contenedorHorarios.innerHTML = '<p>Calculando disponibilidad...</p>';
    horaSeleccionada = null;
    btnConfirmar.classList.remove('activo');
    btnConfirmar.innerText = "Confirmar Reserva";
    feedback.innerText = "";

    if (!fechaSeleccionada) return;

    const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const nombreDia = diasSemana[fechaObj.getDay()];

    const diaLaboral = medicoActual.disponibilidad.find(d => d.dia === nombreDia);

    if (!diaLaboral) {
        contenedorHorarios.innerHTML = `<p class="text-danger">El Dr. no atiende los ${nombreDia}.</p>`;
        feedback.innerText = "Día no disponible";
        feedback.className = "msg-feedback text-danger";
        return;
    }

    try {
        const todosLosTurnos = await listarTurnos();

        const horariosOcupados = todosLosTurnos
            .filter(t => 
                t.doctorId === medicoActual.id && 
                t.fecha === fechaSeleccionada && 
                t.estado !== 'cancelado'
            )
            .map(t => t.hora);

        const horariosLibres = diaLaboral.horarios.filter(h => !horariosOcupados.includes(h));

        contenedorHorarios.innerHTML = ''; 
        if (horariosLibres.length > 0) {
            feedback.innerText = "¡Día disponible! Elige hora:";
            feedback.className = "msg-feedback text-success";

            horariosLibres.forEach(hora => {
                const btn = document.createElement('button');
                btn.className = 'pill-hora';
                btn.innerText = hora;
                
                btn.onclick = () => seleccionarHora(hora, btn);
                
                contenedorHorarios.appendChild(btn);
            });
        } else {
            contenedorHorarios.innerHTML = '<p class="text-danger">Agenda completa para este día.</p>';
        }

    } catch (error) {
        console.error(error);
        contenedorHorarios.innerHTML = '<p>Error al conectar con agenda.</p>';
    }
}

function seleccionarHora(hora, elementoBtn) {
    horaSeleccionada = hora;
    
    document.querySelectorAll('.pill-hora').forEach(b => b.classList.remove('seleccionado'));
    elementoBtn.classList.add('seleccionado');

    const btnConfirmar = document.getElementById('btn-confirmar-reserva');
    btnConfirmar.classList.add('activo');
    btnConfirmar.innerText = `Confirmar Turno: ${hora} hs`;
    btnConfirmar.disabled = false;
}

async function confirmarReserva() {
    if (!horaSeleccionada) {
        alert("Por favor selecciona un horario.");
        return;
    }

    const fecha = document.getElementById('input-fecha').value;
    if (!fecha) {
        alert("Por favor selecciona una fecha");
        return;
    }

    const usuarioStorage = sessionStorage.getItem('usuario');
    if (!usuarioStorage) {
        alert("Error de sesión. Vuelve a iniciar sesión");
        window.location.href = 'login-index.html';
        return;
    }
    const usuario = JSON.parse(usuarioStorage);

    const mensaje = `¿Confirmar turno con ${medicoActual.nombre}\nFecha: ${fecha}\nHora: ${horaSeleccionada}?`;
    
    if(confirm(mensaje)) {
        

        const nuevoTurno = {
            patientId: usuario.id,
            doctorId: medicoActual.id,
            fecha: fecha,
            hora: horaSeleccionada,
            estado: "en_espera"      
        };


        const btn = document.getElementById('btn-confirmar-reserva');
        const textoOriginal = btn.innerText;
        btn.innerText = "Guardando...";
        btn.disabled = true;

        try {
    
            const resultado = await crearTurno(nuevoTurno);

            if (resultado) {
                alert("¡Turno reservado con exito!");
                window.location.href = 'usuario-perfil-index.html'; 
            } else {
                throw new Error("La API no da respuesta");
            }

        } catch (error) {
            console.error("Error al reservar:", error);
            alert("Hubo un error al guardar el turno. Intenta nuevamente.");
            
            btn.innerText = textoOriginal; 
            btn.disabled = false;
        }
    }
}