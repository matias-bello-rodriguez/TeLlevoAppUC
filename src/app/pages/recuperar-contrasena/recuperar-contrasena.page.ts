import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
})
export class RecuperarContrasenaPage {

  constructor(private router: Router) { }

  actualizarContrasena() {
    // Lógica para actualizar la contraseña
    // ...
    // Después de actualizar la contraseña, redirigir a la página principal o a otra página relevante
    this.router.navigate(['/home']);
  }
}