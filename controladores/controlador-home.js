import { listarMedicos } from '../servicios/servicios-medicos.js';
import { listarUsuarios } from '../servicios/servicios-usuarios.js';
import { listarTurnos } from '../servicios/servicios-turnos.js';

const htmlHome = 
`
<div class="row mb-3">
    <div class="col-12">
        <h4 class="m-0 text-dark">
            <i class="fas fa-calendar-alt mr-2"></i>
            <span id="fechaActual" class="font-weight-light">Cargando fecha...</span>
        </h4>
    </div>
</div>

<div class="row">
    <div class="col-lg-4 col-6">
        <div class="small-box bg-info">
            <div class="inner">
                <h3 id="cantMedicos">0</h3>
                <p>Médicos Registrados</p>
            </div>
            <div class="icon"><i class="fas fa-user-md"></i></div>
            <a href="#/medicos" class="small-box-footer">Ir a Médicos <i class="fas fa-arrow-circle-right"></i></a>
        </div>
    </div>

    <div class="col-lg-4 col-6">
        <div class="small-box bg-warning">
            <div class="inner">
                <h3 id="cantPacientes">0</h3>
                <p>Pacientes Registrados</p>
            </div>
            <div class="icon"><i class="fas fa-users"></i></div>
            <a href="#/usuarios" class="small-box-footer">Ir a Usuarios <i class="fas fa-arrow-circle-right"></i></a>
        </div>
    </div>

    <div class="col-lg-4 col-6">
        <div class="small-box bg-success">
            <div class="inner">
                <h3 id="cantTurnosMes">0</h3>
                <p>Turnos del Mes (En Espera)</p>
            </div>
            <div class="icon"><i class="fas fa-calendar-check"></i></div>
            <a href="#/turnos" class="small-box-footer">Ir a Agenda <i class="fas fa-arrow-circle-right"></i></a>
        </div>
    </div>
</div>
`;

export async function Home() {
    document.querySelector('.contenidoTitulo').innerHTML = 'Dashboard Principal';
    document.querySelector('.rutaMenu').innerHTML = 'Inicio';
    document.getElementById('contenidoPrincipal').innerHTML = htmlHome;

    const hoy = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let fechaTexto = hoy.toLocaleDateString('es-ES', opciones);
    fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
    document.getElementById('fechaActual').innerText = fechaTexto;

    const [medicos, usuarios, turnos] = await Promise.all([
        listarMedicos(),
        listarUsuarios(),
        listarTurnos()
    ]);

    if (medicos) document.getElementById('cantMedicos').innerText = medicos.length;
    
    if (usuarios) {
        const pacientes = usuarios.filter(u => !u.role || u.role.toLowerCase() === 'paciente');
        document.getElementById('cantPacientes').innerText = pacientes.length;
    }

    if (turnos) {
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();
        
        const turnosMes = turnos.filter(t => {
            const fechaT = new Date(t.fecha + 'T00:00:00');
            return t.estado === 'en_espera' && 
                   fechaT.getMonth() === mesActual && 
                   fechaT.getFullYear() === anioActual;
        });
        document.getElementById('cantTurnosMes').innerText = turnosMes.length;
    }
}