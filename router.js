import {obteneryCargarMedicos} from './controladores/controlador-medicos.js'
import { Usuarios } from "./controladores/controlador-usuarios.js";
import { Turnos } from "./controladores/controlador-turnos.js"; 
import { Home } from './controladores/controlador-home.js';



function navegar() {
    let hash = location.hash;

    if (hash === '#/medicos') {
        obteneryCargarMedicos();
    } 

    else if (hash === '#/usuarios') {
    Usuarios();}

    else if (hash === '#/turnos') {
    Turnos();}
    
    else if (hash === '#/home' || hash === '') {
        document.getElementById('contenidoPrincipal').innerHTML = '<h1>Inicio</h1>';
        Home()
    }
}







window.addEventListener('hashchange', navegar);
window.addEventListener('load', navegar);      