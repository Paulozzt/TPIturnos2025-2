import { listarTurnos, modificarTurno } from '../servicios/servicios-turnos.js';
import { listarMedicos } from '../servicios/servicios-medicos.js';
import { editarUsuario } from '../servicios/servicios-usuarios.js';

const htmlModalPerfil = `
<div class="modal fade" id="modal-editar-perfil">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-primary">
                <h4 class="modal-title">Editar Mi Perfil</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="form-editar-perfil">
                    <div class="text-center mb-4">
                        <img id="imgPreviewPerfil" src="" class="profile-user-img img-fluid img-circle" 
                             style="width: 120px; height: 120px; object-fit: cover; border: 3px solid #001b48;">
                        <input type="hidden" id="avatarPerfilBase64">
                        <div class="mt-2">
                            <label for="inputFotoPerfil" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-camera"></i> Cambiar Foto
                            </label>
                            <input type="file" id="inputFotoPerfil" style="display: none;" accept="image/png, image/jpeg">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" class="form-control" id="inputNombrePerfil" required>
                    </div>
                    <div class="form-group">
                        <label>Email (No editable)</label>
                        <input type="email" class="form-control" id="inputEmailPerfil" disabled style="background-color: #e9ecef;">
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" class="form-control" id="inputPassPerfil" required>
                        <small class="text-muted">Escribe tu contraseña actual o una nueva.</small>
                    </div>
                </form>
            </div>
            <div class="modal-footer justify-content-between">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btnGuardarPerfil">Guardar Cambios</button>
            </div>
        </div>
    </div>
</div>`;

document.addEventListener('DOMContentLoaded', async () => {
    const usuarioStorage = sessionStorage.getItem('usuario');
    if (!usuarioStorage) {
        window.location.href = 'login-index.html';
        return;
    }
    const usuario = JSON.parse(usuarioStorage);

    document.body.insertAdjacentHTML('beforeend', htmlModalPerfil);

    actualizarTarjetaUsuario(usuario);


    await cargarMisTurnos(usuario.id);

    const inputFoto = document.getElementById('inputFotoPerfil');
    inputFoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.size < 40000) { 
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                document.getElementById('imgPreviewPerfil').src = reader.result;
                document.getElementById('avatarPerfilBase64').value = reader.result;
            }
        } else {
            alert("La imagen es muy pesada (Max 40kb).");
            inputFoto.value = '';
        }
    });

    document.getElementById('btnGuardarPerfil').addEventListener('click', async () => {
        const nuevoNombre = document.getElementById('inputNombrePerfil').value;
        const nuevaPass = document.getElementById('inputPassPerfil').value;
        const nuevaFoto = document.getElementById('avatarPerfilBase64').value;

        if (!nuevoNombre || !nuevaPass) {
            alert("El nombre y la contraseña son obligatorios.");
            return;
        }

        const datosActualizados = {
            nombre: nuevoNombre,
            password: nuevaPass,
            avatar: nuevaFoto,
            email: usuario.email,
            role: usuario.role 
        };

        const btn = document.getElementById('btnGuardarPerfil');
        btn.innerText = "Guardando...";
        btn.disabled = true;

        try {
            await editarUsuario(usuario.id, datosActualizados);
            const usuarioNuevoLocal = { ...usuario, ...datosActualizados };
            sessionStorage.setItem('usuario', JSON.stringify(usuarioNuevoLocal));

            alert("Perfil actualizado correctamente.");
            actualizarTarjetaUsuario(usuarioNuevoLocal);
            $('#modal-editar-perfil').modal('hide');

        } catch (error) {
            console.error(error);
            alert("Error al actualizar perfil.");
        } finally {
            btn.innerText = "Guardar Cambios";
            btn.disabled = false;
        }
    });
});



function actualizarTarjetaUsuario(usuario) {
    const contenedor = document.getElementById('contenedor-perfil-horizontal');
    if(!contenedor) {
        console.error("No encuentro el contenedor #contenedor-perfil-horizontal");
        return;
    }


    const avatar = usuario.avatar || '/assets/img/result_Avatar3d.png';

    contenedor.innerHTML = `
        <div class="card-body">
            <div class="row align-items-center">
                
                <div class="col-md-2 text-center">
                    <img src="${avatar}" class="profile-user-img img-fluid img-circle" 
                         style="width: 100px; height: 100px; object-fit: cover; border: 3px solid #001b48;">
                </div>

                <div class="col-md-6 text-center text-md-left">
                    <h3 class="font-weight-bold" style="color: #001b48; margin-bottom: 5px;">${usuario.nombre}</h3>
                    <p class="text-muted mb-1"><i class="fas fa-envelope"></i> ${usuario.email}</p>
                    <span class="badge badge-info" style="font-size: 1rem;">${usuario.role}</span>
                </div>

                <div class="col-md-4 text-center text-md-right mt-3 mt-md-0">
                    <button class="btn btn-primary mb-2" onclick="abrirModalPerfil()">
                        <i class="fas fa-pencil-alt"></i> Editar Perfil
                    </button>
                    
                    <button class="btn btn-outline-danger mb-2" onclick="cerrarSesionLanding(event)">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </button>
                </div>

            </div>
        </div>
    `;
}

// Funciones Globales
window.abrirModalPerfil = () => {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    
    document.getElementById('inputNombrePerfil').value = usuario.nombre;
    document.getElementById('inputEmailPerfil').value = usuario.email;
    document.getElementById('inputPassPerfil').value = usuario.password;
    
    const avatar = usuario.avatar || '/assets/img/result_Avatar3d.png';
    document.getElementById('imgPreviewPerfil').src = avatar;
    document.getElementById('avatarPerfilBase64').value = usuario.avatar || "";

    $('#modal-editar-perfil').modal('show');
}

async function cargarMisTurnos(idPaciente) {
    const tbody = document.getElementById('tabla-mis-turnos');
    
    try {
        const [turnos, medicos] = await Promise.all([listarTurnos(), listarMedicos()]);
        const misTurnos = turnos.filter(t => t.patientId === idPaciente);
        
        tbody.innerHTML = '';

        if (misTurnos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No tienes turnos registrados.</td></tr>';
            return;
        }

        misTurnos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        misTurnos.forEach(turno => {
            const medico = medicos.find(m => m.id === turno.doctorId);
            const nombreMedico = medico ? medico.nombre : 'Médico no disponible';

            let badgeColor = 'warning';
            let textoEstado = 'En Espera';
            if (turno.estado === 'cancelado') { badgeColor = 'danger'; textoEstado = 'Cancelado'; }
            if (turno.estado === 'finalizado') { badgeColor = 'success'; textoEstado = 'Finalizado'; }
            if (turno.estado === 'no_asistio') { badgeColor = 'dark'; textoEstado = 'Ausente'; }

            let botonCancelar = '';
            if (turno.estado === 'en_espera') {
                botonCancelar = `
                    <button class="btn btn-sm btn-danger" onclick="cancelarMiTurno('${turno.id}')" title="Cancelar Turno">
                        <i class="fas fa-times"></i>
                    </button>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${turno.fecha}</td>
                    <td>${turno.hora}</td>
                    <td><strong>${nombreMedico}</strong></td>
                    <td><span class="badge badge-${badgeColor}">${textoEstado}</span></td>
                    <td>${botonCancelar}</td>
                </tr>`;
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar turnos.</td></tr>';
    }
}

window.cancelarMiTurno = async (idTurno) => {
    if (confirm("¿Estás seguro de que deseas cancelar este turno?")) {
        await modificarTurno(idTurno, { estado: 'cancelado' });
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        await cargarMisTurnos(usuario.id);
    }
}

window.cerrarSesionLanding = (e) => {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = 'login-index.html';
}