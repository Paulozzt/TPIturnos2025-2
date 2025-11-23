import { loginUsuario } from '../servicios/servicios-usuarios.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const formulario = document.getElementById('form-login');

    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const boton = formulario.querySelector('button[type="submit"]');

  
            const textoOriginal = boton.innerText;
            boton.innerText = "Verificando...";
            boton.disabled = true;

            const resultado = await loginUsuario(email, password);

            if (resultado.exito) {
                sessionStorage.setItem('usuario', JSON.stringify(resultado.usuario));
                const rol = resultado.usuario.role;

                if (rol === 'Paciente') {
                    window.location.href = 'landing-index.html';
                } else if (rol === 'Admin'){
                    
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'landing-index.html';
                }

            } else {

                alert(resultado.mensaje);
                boton.innerText = textoOriginal;
                boton.disabled = false;
            }
        });
    }
});