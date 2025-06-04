import { Cuenta } from "./gestorCuentas.js/cuenta";

export class cuentaAdministrador extends Cuenta {
    constructor(usuario, id, correo, contraseña) {
        super(usuario, id, correo, contraseña, 'administrador');
    }
}