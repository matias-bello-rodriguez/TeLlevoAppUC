import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
})
export class RecuperarContrasenaPage {
  email: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async recuperarContrasena() {
    try {
      // Validar que el correo electrónico no esté vacío
      if (!this.email) {
        this.mostrarMensaje('Por favor, ingresa tu correo electrónico.');
        return;
      }

      // Llamada al servicio para recuperar contraseña
      await this.authService.resetPassword(this.email);

      this.mostrarMensaje('Se mandó un email para hacer los cambios!');
      
      // Redirige a la página de inicio de sesión
      this.router.navigate(['/login']);
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('Error al enviar el correo electrónico para restablecer la contraseña.');
    }
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }
}