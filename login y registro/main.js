
import { cambiarClave, cerrarSesion, iniciarSesion, obtenerUsuarioActivo, registrarUsuario, cargarCuenta } from './gestorUsuarios.js';

let cuentaActiva = null;

// Referencias DOM
const seccionLogin = document.getElementById('signIn');
const seccionRegistro = document.getElementById('signUp');
const seccionCambioPassword = document.getElementById('seccionCambioPassword');
const mensajeSistema = document.getElementById('mensajeSistema');

const nombreUsuarioSpan = document.getElementById('nombreUsuario');

// Función para mostrar mensaje en pantalla
function mostrarMensaje(texto, esError = false) {
    mensajeSistema.textContent = texto;
    mensajeSistema.classList.remove('oculto');
    mensajeSistema.style.color = esError ? 'red' : 'green';
    setTimeout(() => {
        mensajeSistema.classList.add('oculto');
    }, 4000);
}

// Actualizar datos de usuario en menú principal
function actualizarDatosUsuario() {
    if (!cuentaActiva) return;
    nombreUsuarioSpan.textContent = cuentaActiva.usuario;
}

// Manejar formulario login
document.getElementById('signIn').addEventListener('submit', e => {
    e.preventDefault();
    const usuario = document.getElementById('usuarioLogin').value.trim();
    const contraseña = document.getElementById('passwordLogin').value.trim();

    const resultado = iniciarSesion(usuario, contraseña);
    if (resultado === 'Login exitoso') {
        cuentaActiva = cargarCuenta(usuario);
        actualizarDatosUsuario();
        mostrarMenuUsuario(usuario);
        mostrarMensaje('Bienvenido ' + usuario);
        e.target.reset();
    } else {
        mostrarMensaje(resultado, true);
    }
});


// Manejar formulario registro
document.getElementById('signUp').addEventListener('submit', e => {
    e.preventDefault();
    const usuario = document.getElementById('usuarioRegistro').value.trim();
    const id = document.getElementById('idRegistro').value.trim();
    const correo = document.getElementById('correoRegistro').value.trim();
    const contraseña = document.getElementById('passwordRegistro').value.trim();
    const contraseñaConfirmar = document.getElementById('passwordConfirmacion').value.trim();
    const tipoCuentaRadio = document.querySelector('input[name="tipoCuenta"]:checked');
    if (!tipoCuentaRadio) {
        mostrarMensaje('Seleccione un tipo de cuenta', true);
        return;
    }
    const tipoCuenta = tipoCuentaRadio.value;

    const resultado = registrarUsuario(usuario, id, correo, contraseña, contraseñaConfirmar, tipoCuenta);
    if (resultado === 'Usuario registrado exitosamente') {
        mostrarMensaje('Registro exitoso, ya puede iniciar sesión');
        mostrarSeccion(seccionLogin);
        e.target.reset();
    } else {
        mostrarMensaje(resultado, true);
    }
});

// Botón cerrar sesión
document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    cerrarSesion();
    cuentaActiva = null;
    mostrarSeccion(seccionLogin);
    mostrarMensaje('Sesión cerrada');
});


// Cambio de contraseña
document.getElementById('formCambioPassword').addEventListener('submit', e => {
    e.preventDefault();
    const contraseñaActual = document.getElementById('contraseñaActual').value.trim();
    const contraseñaNueva = document.getElementById('contraseñaNueva').value.trim();
    const ConfirmarContraseña = document.getElementById('ConfirmarContraseña').value.trim();

    const resultado = cambiarClave(cuentaActiva.usuario, contraseñaActual, contraseñaNueva, ConfirmarContraseña);
    if (resultado === 'Contraseña actualizada') {
        mostrarMensaje(resultado);
        e.target.reset();
        mostrarSeccion(seccionMenuPrincipal);
    } else {
        mostrarMensaje(resultado, true);
    }
});
document.getElementById('btnCancelarCambioPassword').addEventListener('click', () => {
    mostrarSeccion(seccionMenuPrincipal);
});

// Al cargar la página, si hay usuario activo, cargar su cuenta y mostrar menú principal
window.addEventListener('load', () => {
    const usuarioActivo = obtenerUsuarioActivo();
    if (usuarioActivo) {
        cuentaActiva = cargarCuenta(usuarioActivo);
        actualizarDatosUsuario();
    } else {
        mostrarSeccion(seccionLogin);
    }
});

//Menu desplegable para usuario
function mostrarMenuUsuario (usuario) {
    const menu = document.getElementById('menuUsuario');

    menu.innerHTML = `
        <div class="usuario-menu">
            <button class="usuario-nombre">${usuario} ▼</button>
            <div class="usuario-opciones oculto" id="opcionesUsuario">
                <button id="btnCambiarClave">Cambiar clave</button>
                <button id="btnCerrarSesion">Cerrar sesión</button>
            </div>
        </div>`;
    
    const botonUsuario = menu.querySelector('.usuario-nombre');
    const opciones = menu.querySelector('.usuario-opciones');
    botonUsuario.addEventListener('click', () => {
        opciones.classList.toggle('oculto');
    });

    document.getElementById('btnCambiarClave').addEventListener('click', () => {
        mostrarSeccion(document.getElementById('seccionCambioPassword'));
    });

    document.getElementById('btnCerrarSesion').addEventListener('click', ()=>{
        cerrarSesion();
        cuentaActiva = null;
        mostrarSeccion(seccionLogin);
        mostrarMensaje('sesión cerrada');
        restaurarMenuLogin();
    });

}

function restaurarMenuLogin(){
    const menu = document.getElementById('menuUsuario');
    menu.innerHTML = `<a href="../login y registro/login.html" id="enlaceLogin">Iniciar Sesión</a>`;
}
