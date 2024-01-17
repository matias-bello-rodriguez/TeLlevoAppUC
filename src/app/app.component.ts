import { Component } from '@angular/core';
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
export class AppComponent {
  public appPages:Page[] = [
    { title: 'Reservar viaje', url: '/viajes', icon: 'car' },
    { title: 'Crear viaje', url: '/crear-viaje', icon: 'bus' },
    { title: 'Perfil', url: '/mi-perfil', icon: 'person' },
    { title: 'Viaje actual', url: '/viaje-actual', icon: 'location-sharp-icon' },
    { title: 'Cerrar sesión', url: '/login', icon: 'log-out-outline', action: 'logout' },
    // Otros ítems del menú...
  ];

  constructor(private router: Router, private alertController:AlertController) {}

  navigateTo(page:Page) {
    if (page.action === 'logout') {
      this.cerrarSesion();
    } else {
      this.router.navigateByUrl(page.url);
    }
  }

  async cerrarSesion() {
    // Lógica de cierre de sesión
    // Aquí va tu lógica para cerrar la sesión...

    const alert = await this.alertController.create({
      header: 'Sesión cerrada',
      message: 'La sesión ha sido cerrada',
      buttons: ['OK']
    });

    await alert.present();
    this.router.navigateByUrl('/inicio');
  }
}
