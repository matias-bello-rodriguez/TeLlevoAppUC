import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router'; // Importar Router
import { AlertController } from '@ionic/angular';
import { RegistroUsuario } from 'src/app/interface';
import { UserDataService } from 'src/app/user-data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  registroUsuario: RegistroUsuario = {
    // Inicializa tus propiedades aquí
    email: '',
    phone: 0,
    firstName: '',
    lastName: '',
    address: '',
    password: '',
    confirmPassword: '',
    patente : '', // O 'conductor', según tu lógica de negocio
  };

  constructor(private router: Router, private userDataService: UserDataService, 
    private afAuth:AngularFireAuth, private alertController:AlertController) { } // Inyecta el servicio aquí

  async ngOnInit() {
    console.log("gkr");

  }

  async iniciarSesion() {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(this.registroUsuario.email, this.registroUsuario.password);
      console.log('Inicio de sesión exitoso', result);
      console.log(this.registroUsuario)

      // Opcional: Almacena los datos del usuario en UserDataService
      // this.userDataService.setUserData(result.user);

      // Redirige al usuario a la página de perfil o home
      this.router.navigateByUrl('/viajes');
    } catch (error) {
      const firebaseError = error as { message: string };
      console.error('Error en el inicio de sesión:', firebaseError.message);
      this.mostrarAlerta('Error en el inicio de sesión: ' + firebaseError.message);
    }
  }

  olvidasteContrasenaClicked() {
    // Navegar a la página de recuperación de contraseña
    this.router.navigate(['/recuperar-contrasena']);
  }

  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Inicio de Sesión',
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

}
