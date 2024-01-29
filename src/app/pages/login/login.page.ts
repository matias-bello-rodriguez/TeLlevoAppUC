import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
    estado: true
  };

  constructor(private router: Router, private userDataService: UserDataService, 
    private afAuth:AngularFireAuth, private alertController:AlertController, private firestore:AngularFirestore) { } // Inyecta el servicio aquí

  async ngOnInit() {
    console.log("gkr");

  }

  async iniciarSesion() {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(this.registroUsuario.email, this.registroUsuario.password);
      console.log('Inicio de sesión exitoso', result);

      // Verifica si el objeto user no es null
      if (result.user) {
        console.log('Usuario:', result.user);
        // Luego, llama al método obtenerYRedirigir con el uid del usuario
        this.obtenerYRedirigir(result.user.uid);
      } else {
        // Maneja el caso en que el objeto user es null
        console.error('Error: No se pudo obtener la información del usuario.');
        this.mostrarAlerta('Error en el inicio de sesión: no se pudo obtener la información del usuario.');
      }
    } catch (error) {
      const firebaseError = error as { message: string };
      console.error('Error en el inicio de sesión:', firebaseError.message);
      this.mostrarAlerta('Error en el inicio de sesión: ' + firebaseError.message);
    }
  }

  obtenerYRedirigir(uid: string) {
    this.firestore.collection('usuarios').doc(uid).valueChanges().subscribe((usuario: any) => {
      // Utiliza setTimeout para retrasar la redirección
      setTimeout(() => {
        if (usuario && usuario.estado !== false) {
          this.router.navigateByUrl('/viajes'); // Redirige a 'viajes' después de 3 segundos
        } else {
          this.router.navigateByUrl('/viaje-actual'); // Redirige a 'viaje-actual' después de 3 segundos
        }
      }, 10000); // 3000 milisegundos = 3 segundos
    }, error => {
      console.error('Error al obtener el estado del usuario:', error);
    });
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
