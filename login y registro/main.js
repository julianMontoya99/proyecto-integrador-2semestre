
import {cerrarSesion, iniciarSesion, obtenerUsuarioActivo, registrarUsuario, cargarCuenta } from './gestorUsuarios.js';

let cuentaActiva = null;

// Referencias DOM
const seccionLogin = document.getElementById('seccionLogin');
const seccionRegistro = document.getElementById('seccionRegistro');
/* const seccionCambioPassword = document.getElementById('seccionCambioPassword'); */
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

// Función para mostrar una sección y ocultar las demás
function mostrarSeccion(seccion) {
    const secciones = [
        seccionLogin,
        seccionRegistro,
    ];
    secciones.forEach(sec => {
        if (!sec) return;
        if (sec === seccion) sec.classList.remove('oculto');
        else sec.classList.add('oculto');
    });
}

// Actualizar datos de usuario en menú principal
function actualizarDatosUsuario() {
    if (!cuentaActiva) return;
    if (nombreUsuarioSpan){
        nombreUsuarioSpan.textContent = cuentaActiva.usuario;
    }
    
}

// Manejar formulario login
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', e => {
        e.preventDefault();
        const usuario = document.getElementById('usuarioLogin').value.trim();
        const contraseña = document.getElementById('passwordLogin').value.trim();

        const resultado = iniciarSesion(usuario, contraseña);
        if (resultado === 'Login exitoso') {
            cuentaActiva = cargarCuenta(usuario);
            actualizarDatosUsuario();
            mostrarMensaje('Bienvenido ' + usuario);
            e.target.reset();
            if (cuentaActiva.tipoCuenta == 'cliente'){
                window.location.replace('../vistaCliente/index.html')
            } else {
                window.location.replace('../vistaAdministrador/index.html')
            }
        } else {
            mostrarMensaje(resultado, true);
        }
    });
}

// Botón para mostrar registro
const btnMostrarRegistro = document.getElementById('btnMostrarRegistro');
if (btnMostrarRegistro) {
    btnMostrarRegistro.addEventListener('click', () => {
        mostrarSeccion(seccionRegistro);
    });
}

// Botón para volver a login desde registro
const btnRegresarLogin = document.getElementById('btnRegresarLogin');
if (btnRegresarLogin) {
    btnRegresarLogin.addEventListener('click', () => {
        mostrarSeccion(seccionLogin);
    });
}

// Manejar formulario registro
const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
    formRegistro.addEventListener('submit', e => {
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
}


// Botón cerrar sesión
document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    cerrarSesion();
    cuentaActiva = null;
    window.location.replace('../../vistaPublica/index.html')
});

// Formularios acciones

// Al cargar la página, si hay usuario activo, cargar su cuenta y mostrar menú principal
window.addEventListener('load', () => {
    const usuarioActivo = obtenerUsuarioActivo();
    if (usuarioActivo) {
        cuentaActiva = cargarCuenta(usuarioActivo);
        actualizarDatosUsuario();

        //mostrar lista de usuarios en el crud si es administrador
        if (cuentaActiva.tipoCuenta === 'administrador'){
            mostrarUsuariosTabla();
        }
        
    } else {
        mostrarSeccion(seccionLogin);
    }
});

//Manejo formulario registro CRUD
// Manejar formulario registro
let editandoUsuario = null; // Variable global para detectar si se está editando

const formRegistroCrud = document.getElementById('formRegistroCrud');

if (formRegistroCrud) {
    formRegistroCrud.addEventListener('submit', e => {
        e.preventDefault();

        const usuario = document.getElementById('usuarioRegistro').value.trim();
        const id = document.getElementById('idRegistro').value.trim();
        const correo = document.getElementById('correoRegistro').value.trim();
        const contraseña = document.getElementById('passwordRegistro').value.trim();
        const contraseñaConfirmar = document.getElementById('passwordConfirmacion').value.trim();
        const tipoCuentaRadio = document.querySelector('input[name="tipoCuenta"]:checked');

        if (!usuario || !id || !correo || !contraseña || !contraseñaConfirmar || !tipoCuentaRadio) {
            mostrarMensaje('Todos los campos son obligatorios', true);
            return;
        }

        const tipoCuenta = tipoCuentaRadio.value;

        // Validaciones comunes
        if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(correo)) {
            mostrarMensaje("Correo electrónico inválido.", true);
            return;
        }
        if (!/^\d{4}$/.test(contraseña)) {
            mostrarMensaje("La contraseña debe ser numérica y tener 4 dígitos.", true);
            return;
        }
        if (contraseña !== contraseñaConfirmar) {
            mostrarMensaje("Las contraseñas no coinciden.", true);
            return;
        }

        let resultado;

        // 🔄 Modo edición
        if (editandoUsuario && editandoUsuario === usuario) {
            const cuentaActualizada = {
                usuario,
                id,
                correo,
                contraseña,
                tipoCuenta
            };
            localStorage.setItem(`cuenta_${usuario}`, JSON.stringify(cuentaActualizada));
            resultado = "Usuario actualizado exitosamente";
            editandoUsuario = null;
        } else {
            // 🆕 Modo registro
            resultado = registrarUsuario(usuario, id, correo, contraseña, contraseñaConfirmar, tipoCuenta);
        }

        // Mensajes y limpieza
        if (resultado.includes('exitosamente')) {
            mostrarMensaje(resultado);
            e.target.reset();
            mostrarUsuariosTabla();
            mostrarSeccion(seccionListado); // Opcional: volver al listado
        } else {
            mostrarMensaje(resultado, true);
        }
    });
}


//lista de usuarios CRUD
function obtenerUsuarios() {
    const usuarios = [];

    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);

        if (clave.startsWith('cuenta_')) {
            try {
                const datos = JSON.parse(localStorage.getItem(clave));
                // Extraemos solo los datos necesarios para el CRUD
                usuarios.push({
                    usuario: datos.usuario,
                    id: datos.id,
                    correo: datos.correo,
                    tipoCuenta: datos.tipoCuenta
                });
            } catch (error) {
                console.warn(`Error al leer ${clave}:`, error);
            }
        }
    }

    return usuarios;
}


function mostrarUsuariosTabla(){
    const tabla = document.getElementById('tablaUsuarios');
    if(!tabla) return;

    const usuariosTabla = obtenerUsuarios();
    tabla.innerHTML = ''; // Limpiar tabla

    usuariosTabla.forEach(usuario => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${usuario.usuario}</td>
            <td>${usuario.id}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.tipoCuenta}</td>
            <td>
                <button onclick="editarUsuario('${usuario.usuario}')">✏️</button>
                <button onclick="eliminarUsuario('${usuario.usuario}')">🗑️</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

window.eliminarUsuario = function(usuario) {
    const confirmar = confirm(`¿Estás seguro de eliminar al usuario "${usuario}"?`);
    if (!confirmar) return;

    localStorage.removeItem(`cuenta_${usuario}`);
    mostrarMensaje(`Usuario "${usuario}" eliminado.`);
    mostrarUsuariosTabla();
}

window.editarUsuario = function(usuario) {
    const datos = localStorage.getItem(`cuenta_${usuario}`);
    if (!datos) return mostrarMensaje('Usuario no encontrado', true);

    const obj = JSON.parse(datos);

    // Rellenar el formulario
    document.getElementById('usuarioRegistro').value = obj.usuario;
    document.getElementById('idRegistro').value = obj.id;
    document.getElementById('correoRegistro').value = obj.correo;
    document.getElementById('passwordRegistro').value = obj.contraseña;
    document.getElementById('passwordConfirmacion').value = obj.contraseña;
    document.querySelector(`input[name="tipoCuenta"][value="${obj.tipoCuenta}"]`).checked = true;

    // Evita crear uno nuevo al guardar
    editandoUsuario = obj.usuario;
    mostrarSeccion(seccionRegistro);
}




