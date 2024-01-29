import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

interface Page {
  title: string;
  url: string;
  icon: string;
  action?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  public appPages: Page[] = [];

  constructor(
    private router: Router, 
    private alertController: AlertController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.obtenerEstadoUsuario(user.uid);
      } else {
        // Manejo para usuarios no autenticados o cuando se cierra la sesión
      }
    });
  }

  obtenerEstadoUsuario(uid: string) {
    this.firestore.collection('usuarios').doc(uid).valueChanges().subscribe((usuario: any) => {
      if (usuario.estado !== true  || usuario.patente == '0') {
        // Usuario con estado 'false' o patente '0'
        this.appPages = [

          { title: 'Viaje actual', url: '/viaje-actual', icon: 'car-sport' },
          { title: 'Perfil', url: '/mi-perfil', icon: 'person' },
          { title: 'Historial de viaje', url: '/historial-viajes', icon: 'folder-open-outline' },
          { title: 'Reservar viaje', url: '/viajes', icon: 'car'},
          { title: 'Cerrar sesión', url: '/inicio', icon: 'log-out-outline', action: 'logout' },

        ];
      } else {
        // Usuario con estado 'true' y patente distinta de '0'
        this.appPages = [
          { title: 'Crear viaje', url: '/crear-viaje', icon: 'bus' },
          { title: 'Viaje actual', url: '/viaje-actual', icon: 'car-sport' },
          { title: 'Reservar viaje', url: '/viajes', icon: 'car' },
          { title: 'Perfil', url: '/mi-perfil', icon: 'person' },
          { title: 'Historial de viaje', url: '/historial-viajes', icon: 'folder-open-outline' },
          { title: 'Cerrar sesión', url: '/inicio', icon: 'log-out-outline', action: 'logout' }
        ];
      }
    });
  }

  navigateTo(page: Page) {
    if (page.action === 'logout') {
      this.cerrarSesion();
    } else {
      this.router.navigateByUrl(page.url);
    }
  }

  async cerrarSesion() {
    // Implementa aquí la lógica para cerrar sesión
    // Por ejemplo, desconectar al usuario de Firebase

    const alert = await this.alertController.create({
      header: 'Sesión cerrada',
      message: 'La sesión ha sido cerrada',
      buttons: ['OK']
    });

    await alert.present();
    this.router.navigateByUrl('/inicio'); // Redirige al usuario a la página de inicio de sesión
  }
}
