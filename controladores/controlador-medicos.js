import { listarMedicos, crearMedico, borrarMedico, editarMedico, obtenerMedico } from '../servicios/servicios-medicos.js';
import { Medico } from '../modelos/medico.js';

const htmlMedicos = 
`<div class="card">
    <div class="card-header">
        <h3 class="card-title">Gestión de Médicos</h3>
        <div class="card-tools">
             <button class="btn btn-success btn-sm" onclick="abrirModalCrear()">
                <i class="fas fa-plus"></i> Nuevo Médico
             </button>
        </div>
    </div>
    <div class="card-body p-0">
        <table class="table table-striped projects">
            <thead>
                <tr>
                    <th>ID</th>
                    <th style="width: 30%">Nombre</th>
                    <th style="width: 15%">Avatar</th>
                    <th>Especialidad</th>
                    <th style="width: 20%" class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody id="tbodyMedicos">
            </tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="modal-nuevo-medico">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-primary">
                <h4 class="modal-title" id="modalTitulo">Registrar Médico</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="form-nuevo-medico">
                    <input type="hidden" id="idMedico">
                    
                    <input type="hidden" id="avatarBase64">

                    <div class="row mb-4 text-center">
                        <div class="col-12">
                            <img id="imgPreview" src="assets/dist/img/user2-160x160.jpg" class="profile-user-img img-fluid img-circle" style="width: 100px; height: 100px; object-fit: cover; border: 3px solid #adb5bd;">
                            <div class="mt-2">
                                <label for="inputFoto" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-camera"></i> Cambiar Avatar
                                </label>
                                <input type="file" id="inputFoto" style="display: none;" accept="image/png, image/jpeg">
                            </div>
                            <small class="text-muted">Max. 40KB (JPG/PNG)</small>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Nombre Completo</label>
                                <input type="text" class="form-control" id="nuevoNombre" required placeholder="Ej: Dr. House">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Especialidad</label>
                                <select class="form-control" id="nuevoEspecialidad">
                                    <option>Cardiología</option>
                                    <option>Pediatría</option>
                                    <option>Clínica Médica</option>
                                    <option>Traumatología</option>
                                    <option>Cirugía</option>
                                    <option>Diagnóstico</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr>
                    <h5>Disponibilidad Horaria</h5>
                    <p class="text-muted small">Marca los días y define hora inicio/fin (Formato 24hs).</p>

                    <div id="contenedor-dias">
                        ${generarHTMLDias()}
                    </div>

                </form>
            </div>
            <div class="modal-footer justify-content-between">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btnGuardarMedico">Guardar</button>
            </div>
        </div>
    </div>
</div>`;

function generarHTMLDias() {
    const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
    let html = '';
    dias.forEach(dia => {
        html += `
        <div class="row mb-2 align-items-center">
            <div class="col-2">
                <div class="icheck-primary d-inline">
                    <input type="checkbox" id="check${dia}" class="check-dia" data-dia="${dia}">
                    <label for="check${dia}">${dia.substr(0,3)}</label>
                </div>
            </div>
            <div class="col-5">
                <input type="number" class="form-control form-control-sm" id="inicio${dia}" placeholder="Desde" min="0" max="23" disabled>
            </div>
            <div class="col-5">
                <input type="number" class="form-control form-control-sm" id="fin${dia}" placeholder="Hasta" min="0" max="23" disabled>
            </div>
        </div>`;
    });
    return html;
}

export async function obteneryCargarMedicos() {
    
 
    document.querySelector('.contenidoTitulo').innerHTML = 'Listado de Médicos';
    document.querySelector('.rutaMenu').innerHTML = 'Médicos';
    document.getElementById('contenidoPrincipal').innerHTML = htmlMedicos;

    await cargarTabla();

    




    const inputFoto = document.getElementById('inputFoto');
    
    inputFoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return; 

        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            alert("Error: Solo JPG o PNG.");
            inputFoto.value = ''; 
            return;
        }
        
        if (file.size > 40960) { 
            alert("Error: Máximo 40kb.");
            inputFoto.value = '';
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            document.getElementById('imgPreview').src = reader.result;
            document.getElementById('avatarBase64').value = reader.result;
        };
    });

    

    const checks = document.querySelectorAll('.check-dia');
    checks.forEach(check => {
        check.addEventListener('change', (e) => {
            const dia = e.target.id.replace('check', '');
            const inputInicio = document.getElementById('inicio' + dia);
            const inputFin = document.getElementById('fin' + dia);

            if (e.target.checked) {
                inputInicio.disabled = false;
                inputFin.disabled = false;
            } else {
                inputInicio.disabled = true;
                inputFin.disabled = true;
                inputInicio.value = '';
                inputFin.value = '';
            }
        });
    });

   
    document.getElementById('btnGuardarMedico').addEventListener('click', async () => {
        const id = document.getElementById('idMedico').value;
        const nombre = document.getElementById('nuevoNombre').value;
        const especialidad = document.getElementById('nuevoEspecialidad').value;
        const fotoFinal = document.getElementById('avatarBase64').value;

        if (!nombre) {
            alert("El nombre es obligatorio");
            return;
        }

        const disponibilidadCalculada = generarDisponibilidad();

        if (id) {
            
            const datosEditados = { 
                nombre, 
                especialidad, 
                disponibilidad: disponibilidadCalculada,
                avatar: fotoFinal 
            }; 
            await editarMedico(id, datosEditados);
            alert("Médico actualizado!");
        } else {
            
            const nuevo = new Medico(nombre, especialidad, fotoFinal, disponibilidadCalculada);
            console.log("Objeto a guardar:", nuevo);
            await crearMedico(nuevo);
            alert("Médico creado!");
        }

        $('#modal-nuevo-medico').modal('hide');
        await cargarTabla();
    });

    
    

    function generarDisponibilidad() {
        const disponibilidad = [];
        const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];

        dias.forEach(dia => {
            const check = document.getElementById('check' + dia);
            if (check && check.checked) {
                const inicio = parseInt(document.getElementById('inicio' + dia).value);
                const fin = parseInt(document.getElementById('fin' + dia).value);
                
                if (!isNaN(inicio) && !isNaN(fin) && fin > inicio) {
                    const horarios = [];
                    for (let hora = inicio; hora < fin; hora++) {
                        const horaFormateada = hora.toString().padStart(2, '0') + ":00";
                        horarios.push(horaFormateada);
                    }
                    disponibilidad.push({
                        dia: dia === "Miercoles" ? "Miércoles" : dia, 
                        horarios: horarios
                    });
                }
            }
        });
        return disponibilidad;
    }

    async function cargarTabla() {
        const tbody = document.getElementById('tbodyMedicos');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Cargando...</td></tr>';

        const lista = await listarMedicos();
        
        if (!lista) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">Error de API</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        lista.forEach(medico => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${medico.id}</td>
                <td><b>${medico.nombre}</b></td>
                <td>
                    <img src="${medico.avatar}" class="img-circle" style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${medico.especialidad}</td>
                <td class="text-right">
                    <button class="btn btn-info btn-sm" onclick="prepararEdicion('${medico.id}')">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="borrar('${medico.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>`;
            tbody.appendChild(fila);
        });
    }


    



    window.borrar = async (id) => {
        if (confirm("¿Eliminar médico?")) {
            await borrarMedico(id);
            await cargarTabla();
        }
    }

    window.abrirModalCrear = () => {
        document.getElementById('form-nuevo-medico').reset();
        document.getElementById('idMedico').value = ""; 
        document.getElementById('modalTitulo').innerText = "Registrar Nuevo Médico";
        document.getElementById('avatarBase64').value = "";
        document.getElementById('imgPreview').src = "assets/dist/img/user2-160x160.jpg"; 
        
        document.querySelectorAll('.form-control-sm').forEach(input => {
            input.disabled = true; input.value = '';
        });
        
        $('#modal-nuevo-medico').modal('show');
    }

    window.prepararEdicion = async (id) => {
        document.getElementById('form-nuevo-medico').reset();
        document.querySelectorAll('.form-control-sm').forEach(i => { i.disabled = true; i.value = ''; });

        const medico = await obtenerMedico(id);
        if (!medico) { alert("Error al cargar"); return; }

        document.getElementById('idMedico').value = medico.id;
        document.getElementById('nuevoNombre').value = medico.nombre;
        document.getElementById('nuevoEspecialidad').value = medico.especialidad;
        document.getElementById('modalTitulo').innerText = "Editar Médico";
        
        document.getElementById('imgPreview').src = medico.avatar;
        document.getElementById('avatarBase64').value = medico.avatar;

        if (medico.disponibilidad) {
            medico.disponibilidad.forEach(item => {
                let diaKey = item.dia === "Miércoles" ? "Miercoles" : item.dia; 
                const check = document.getElementById('check' + diaKey);
                if (check) {
                    check.checked = true;
                    document.getElementById('inicio' + diaKey).disabled = false;
                    document.getElementById('fin' + diaKey).disabled = false;
                    
                    if(item.horarios.length > 0) {
                        const inicio = parseInt(item.horarios[0]);
                        const fin = parseInt(item.horarios[item.horarios.length-1]) + 1;
                        document.getElementById('inicio' + diaKey).value = inicio;
                        document.getElementById('fin' + diaKey).value = fin;
                    }
                }
            });
        }

        $('#modal-nuevo-medico').modal('show');
    }
}