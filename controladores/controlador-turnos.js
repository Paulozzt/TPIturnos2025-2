import { listarTurnos, crearTurno, borrarTurno, modificarTurno, obtenerTurno } from '../servicios/servicios-turnos.js';
import { listarMedicos, obtenerMedico } from '../servicios/servicios-medicos.js';
import { listarUsuarios } from '../servicios/servicios-usuarios.js';
import { Turno } from '../modelos/Turno.js';

const htmlTurnos = 
`<div class="card">
    <div class="card-header">
        <h3 class="card-title">Gestión de Turnos</h3>
        <div class="card-tools">
             <button class="btn btn-primary btn-sm" onclick="abrirModalTurno()">
                <i class="fas fa-plus"></i> Nuevo Turno
             </button>
        </div>
    </div>
    <div class="card-body p-0">
        <table class="table table-striped projects">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Médico</th>
                    <th>Paciente</th>
                    <th>Estado</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody id="tbodyTurnos">
            </tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="modal-turno">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-primary">
                <h4 class="modal-title" id="tituloModalTurno">Reservar Turno</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="form-turno">
                    <input type="hidden" id="idTurno">

                    <div class="form-group">
                        <label>Paciente</label>
                        <select class="form-control" id="selectPaciente"></select>
                    </div>
                    <div class="form-group">
                        <label>Médico</label>
                        <select class="form-control" id="selectMedico"></select>
                    </div>
                    <div class="form-group">
                        <label>Fecha</label>
                        <input type="date" class="form-control" id="inputFecha">
                    </div>
                    <div class="form-group">
                        <label>Hora</label>
                        <select class="form-control" id="selectHora">
                            <option value="">Selecciona fecha primero</option>
                        </select>
                        <small id="avisoHorario" class="text-muted"></small>
                    </div>
                </form>
            </div>
            <div class="modal-footer justify-content-between">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btnGuardarTurno">Confirmar</button>
            </div>
        </div>
    </div>
</div>`;

export async function Turnos() {
    
    document.querySelector('.contenidoTitulo').innerHTML = 'Agenda de Turnos';
    document.querySelector('.rutaMenu').innerHTML = 'Turnos';
    document.getElementById('contenidoPrincipal').innerHTML = htmlTurnos;

    await cargarSelectores(); 
    await cargarTablaCruzada();


    document.getElementById('selectMedico').addEventListener('change', actualizarHorarios);
    document.getElementById('inputFecha').addEventListener('change', actualizarHorarios);

 
    async function actualizarHorarios() {
        const medicoId = document.getElementById('selectMedico').value;
        const fechaStr = document.getElementById('inputFecha').value; 
        const selectHora = document.getElementById('selectHora');
        const aviso = document.getElementById('avisoHorario');
        const idTurnoEditando = document.getElementById('idTurno').value; 

        
        selectHora.innerHTML = '<option value="">Cargando...</option>';
        aviso.innerText = "";
        aviso.className = "text-muted";

        if (!medicoId || !fechaStr) {
            selectHora.innerHTML = '<option value="">Selecciona médico y fecha</option>';
            return;
        }

        try {
           
            const medico = await obtenerMedico(medicoId);
            
            const fechaObj = new Date(fechaStr + 'T00:00:00');
            const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const nombreDia = diasSemana[fechaObj.getDay()];


            const diaLaboral = medico.disponibilidad 
                ? medico.disponibilidad.find(d => d.dia === nombreDia) 
                : null;

            if (!diaLaboral) {
                selectHora.innerHTML = '';
                aviso.innerText = `El médico no atiende los ${nombreDia}.`;
                aviso.className = "text-danger";
                return;
            }


            const todosLosTurnos = await listarTurnos();
            
            const horariosOcupados = todosLosTurnos
                .filter(t => 
                    t.doctorId === medicoId && 
                    t.fecha === fechaStr &&
                    t.id !== idTurnoEditando && 
                    t.estado !== 'cancelado'
                )
                .map(t => t.hora); 

      
            const horariosBase = diaLaboral.horarios; 
            const horariosLibres = horariosBase.filter(h => !horariosOcupados.includes(h));

            
            if (horariosLibres.length > 0) {
                selectHora.innerHTML = horariosLibres.map(h => `<option value="${h}">${h}</option>`).join('');
                aviso.innerText = `${horariosLibres.length} horarios disponibles.`;
                aviso.className = "text-success";
            } else {
                selectHora.innerHTML = '';
                aviso.innerText = "Agenda completa para este día.";
                aviso.className = "text-danger";
            }

        } catch (error) {
            console.error(error);
            selectHora.innerHTML = '<option>Error al calcular</option>';
        }
    }


    document.getElementById('btnGuardarTurno').addEventListener('click', async () => {
        const id = document.getElementById('idTurno').value;
        const pacienteId = document.getElementById('selectPaciente').value;
        const medicoId = document.getElementById('selectMedico').value;
        const fecha = document.getElementById('inputFecha').value;
        const hora = document.getElementById('selectHora').value;

        if (!fecha || !hora) { 
            alert("Por favor selecciona un horario disponible"); 
            return; 
        }

        if (id) {

            await modificarTurno(id, { patientId: pacienteId, doctorId: medicoId, fecha: fecha, hora: hora });
            alert("Turno modificado");
        } else {

            const nuevoTurno = new Turno(pacienteId, medicoId, fecha, hora);
            await crearTurno(nuevoTurno);
            alert("Turno reservado");
        }
        
        $('#modal-turno').modal('hide');
        await cargarTablaCruzada();
    });

  
    async function cargarTablaCruzada() {
        const tbody = document.getElementById('tbodyTurnos');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando agenda...</td></tr>';

        const [turnos, medicos, usuarios] = await Promise.all([
            listarTurnos(),
            listarMedicos(),
            listarUsuarios()
        ]);

        if (!turnos) {
             tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Error de conexión</td></tr>';
             return;
        }

        tbody.innerHTML = '';

        turnos.forEach(turno => {
            const medico = medicos ? medicos.find(m => m.id === turno.doctorId) : null;
            const nombreMedico = medico ? medico.nombre : 'Desconocido';

            const paciente = usuarios ? usuarios.find(u => u.id === turno.patientId) : null;
            const nombrePaciente = paciente ? paciente.nombre : 'Desconocido';

            let colorEstado = 'secondary';
            if (turno.estado === 'finalizado') colorEstado = 'success';
            if (turno.estado === 'cancelado') colorEstado = 'danger';
            if (turno.estado === 'en_espera') colorEstado = 'warning';
            if (turno.estado === 'no_asistio') colorEstado = 'dark';

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${turno.fecha}</td>
                <td>${turno.hora}</td>
                <td>${nombreMedico}</td>
                <td>${nombrePaciente}</td>
                <td>
                    <select class="form-control form-control-sm border-${colorEstado} text-${colorEstado}" 
                            style="font-weight: bold;"
                            onchange="cambiarEstado('${turno.id}', this.value)">
                        <option value="en_espera" ${turno.estado === 'en_espera' ? 'selected' : ''}>En Espera</option>
                        <option value="finalizado" ${turno.estado === 'finalizado' ? 'selected' : ''}>Finalizado</option>
                        <option value="no_asistio" ${turno.estado === 'no_asistio' ? 'selected' : ''}>No Asistió</option>
                        <option value="cancelado" ${turno.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td class="text-right">
                    <button class="btn btn-info btn-sm" onclick="editarTurno('${turno.id}')">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="borrarTurnoGlobal('${turno.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    async function cargarSelectores() {
        const medicos = await listarMedicos();
        const usuarios = await listarUsuarios();
        
        const selMed = document.getElementById('selectMedico');
        const selPac = document.getElementById('selectPaciente');

        if (medicos) {
            selMed.innerHTML = medicos.map(m => `<option value="${m.id}">${m.nombre} - ${m.especialidad}</option>`).join('');
        }
        
        if (usuarios) {
            const pacientesReales = usuarios.filter(u => !u.role || u.role.toLowerCase() === 'paciente');
            selPac.innerHTML = pacientesReales.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        }
    }


    window.cambiarEstado = async (id, nuevoEstado) => {
        await modificarTurno(id, { estado: nuevoEstado });
        await cargarTablaCruzada();
    }

    window.borrarTurnoGlobal = async (id) => {
        if(confirm("¿Eliminar reserva?")) {
            await borrarTurno(id);
            await cargarTablaCruzada();
        }
    }

    window.abrirModalTurno = () => {
        document.getElementById('form-turno').reset();
        document.getElementById('idTurno').value = "";
        document.getElementById('tituloModalTurno').innerText = "Reservar Turno";
        document.getElementById('selectHora').innerHTML = '<option value="">Selecciona fecha primero</option>';
        document.getElementById('avisoHorario').innerText = "";
        $('#modal-turno').modal('show');
    }

    window.editarTurno = async (id) => {
        const turno = await obtenerTurno(id);
        if (!turno) { alert("Error al cargar turno"); return; }

        document.getElementById('idTurno').value = turno.id;
        document.getElementById('selectPaciente').value = turno.patientId;
        document.getElementById('selectMedico').value = turno.doctorId;
        document.getElementById('inputFecha').value = turno.fecha;
        

        await actualizarHorarios();
        
        document.getElementById('selectHora').value = turno.hora;
        document.getElementById('tituloModalTurno').innerText = "Modificar Turno";
        $('#modal-turno').modal('show');
    }
}