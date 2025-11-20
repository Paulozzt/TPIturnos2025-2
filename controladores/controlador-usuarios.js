import { listarUsuarios, crearUsuario, borrarUsuario, editarUsuario, obtenerUsuario } from '../servicios/servicios-usuarios.js';
import { Usuario } from '../modelos/Usuario.js';

const htmlUsuarios = 
`<div class="card">
    <div class="card-header">
        <h3 class="card-title">Gestión de Usuarios</h3>
        <div class="card-tools">
             <button class="btn btn-primary btn-sm" onclick="abrirModalUsuario()">
                <i class="fas fa-plus"></i> Nuevo Usuario
             </button>
        </div>
    </div>
    <div class="card-body p-0">
        <table class="table table-striped projects">
            <thead>
                <tr>
                    <th>ID</th>
                    <th style="width: 30%">Nombre</th>
                    <th style="width: 15%">Rol</th> <th>Email</th>
                    <th style="width: 20%" class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody id="tbodyUsuarios">
            </tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="modal-usuario">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-primary">
                <h4 class="modal-title" id="tituloModalUser">Nuevo Usuario</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="form-usuario">
                    <input type="hidden" id="idUsuario">
                    <input type="hidden" id="avatarUserBase64">

                    <div class="text-center mb-4">
                        <img id="imgPreviewUser" src="assets/dist/img/user2-160x160.jpg" class="profile-user-img img-fluid img-circle" style="width: 100px; height: 100px; object-fit: cover; border: 3px solid #adb5bd;">
                        <div class="mt-2">
                            <label for="inputFotoUser" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-camera"></i> Cambiar Foto
                            </label>
                            <input type="file" id="inputFotoUser" style="display: none;" accept="image/png, image/jpeg">
                        </div>
                        <small class="text-muted">Opcional (Max 40kb)</small>
                    </div>

                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" class="form-control" id="nombreUser" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" id="emailUser" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" class="form-control" id="passUser" required>
                    </div>
                    <div class="form-group">
                        <label>Rol</label>
                        <select class="form-control" id="rolUser">
                            <option value="Paciente">Paciente</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer justify-content-between">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btnGuardarUsuario">Guardar</button>
            </div>
        </div>
    </div>
</div>`;

export async function Usuarios() {
    
    // 1. Inyección HTML
    document.querySelector('.contenidoTitulo').innerHTML = 'Gestión de Usuarios';
    document.querySelector('.rutaMenu').innerHTML = 'Usuarios';
    document.getElementById('contenidoPrincipal').innerHTML = htmlUsuarios;

    await cargarTablaUsuarios();


    const inputFoto = document.getElementById('inputFotoUser');
    inputFoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file && file.size < 40960) { 
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                document.getElementById('imgPreviewUser').src = reader.result;
                document.getElementById('avatarUserBase64').value = reader.result;
            }
        } else {
            alert("Imagen muy pesada (Max 40kb) o formato incorrecto");
            inputFoto.value = '';
        }
    });


    document.getElementById('btnGuardarUsuario').addEventListener('click', async () => {
        const id = document.getElementById('idUsuario').value;
        const nombre = document.getElementById('nombreUser').value;
        const email = document.getElementById('emailUser').value;
        const pass = document.getElementById('passUser').value;
        const rol = document.getElementById('rolUser').value;
        const avatar = document.getElementById('avatarUserBase64').value;

        if (!nombre || !email || !pass) {
            alert("Por favor completa todos los campos");
            return;
        }

        if (id) {

            const datosEditados = { nombre, email, password: pass, role: rol, avatar };
            await editarUsuario(id, datosEditados);
            alert("Usuario actualizado");
        } else {

            const nuevo = new Usuario(nombre, email, pass, rol, avatar);
            await crearUsuario(nuevo);
            alert("Usuario creado");
        }

        $('#modal-usuario').modal('hide');
        await cargarTablaUsuarios();
    });


    async function cargarTablaUsuarios() {
        const tbody = document.getElementById('tbodyUsuarios');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Cargando...</td></tr>';
        
        const lista = await listarUsuarios();
        
        if(!lista) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">Error de conexión</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        lista.forEach(u => {
            const fila = document.createElement('tr');
            

            const badgeClass = (u.role === 'Admin' || u.role === 'ADMIN') ? 'badge-danger' : 'badge-success';

            fila.innerHTML = `
                <td>${u.id}</td>
                <td><b>${u.nombre}</b></td>
                <td>
                    <span class="badge ${badgeClass}" style="font-size: 90%">${u.role}</span>
                </td>
                <td>${u.email}</td>
                <td class="text-right">
                    <button class="btn btn-info btn-sm" onclick="editarUser('${u.id}')">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="borrarUser('${u.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>`;
            tbody.appendChild(fila);
        });
    }


    window.borrarUser = async (id) => {
        if(confirm("¿Borrar usuario?")) {
            await borrarUsuario(id);
            await cargarTablaUsuarios();
        }
    }

    window.abrirModalUsuario = () => {
        document.getElementById('form-usuario').reset();
        document.getElementById('idUsuario').value = "";
        document.getElementById('avatarUserBase64').value = "";
        document.getElementById('imgPreviewUser').src = "assets/dist/img/user2-160x160.jpg";
        document.getElementById('tituloModalUser').innerText = "Nuevo Usuario";
        $('#modal-usuario').modal('show');
    }

    window.editarUser = async (id) => {
        // Limpiamos primero
        document.getElementById('form-usuario').reset();
        
        const user = await obtenerUsuario(id);
        if(!user) { alert("Error al cargar datos"); return; }

        document.getElementById('idUsuario').value = user.id;
        document.getElementById('nombreUser').value = user.nombre;
        document.getElementById('emailUser').value = user.email;
        document.getElementById('passUser').value = user.password;
        document.getElementById('rolUser').value = user.role;
        
        document.getElementById('avatarUserBase64').value = user.avatar;
        document.getElementById('imgPreviewUser').src = user.avatar;

        document.getElementById('tituloModalUser').innerText = "Editar Usuario";
        $('#modal-usuario').modal('show');
    }
}