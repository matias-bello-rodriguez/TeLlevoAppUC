import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { UsuarioDatos, Viaje } from 'src/app/viaje-interface';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {

  usuario$: Observable<any> | undefined; 

  viaje:Viaje = {
    destino: '',
    horaSalida: '',
    pasajerosMaximos: 0,
    tarifa: 0,
    fecha: new Date(),
    patente: '',
    conductor: '',
    email: '',
    suscriptores: null
}  



constructor(private toastController: ToastController,
private router: Router,
private modalController: ModalController,
private alertController: AlertController,
private firestore: AngularFirestore,
private afAuth: AngularFireAuth) { }

ngOnInit() {
console.log("Componente de Crear Viaje inicializado");

this.afAuth.authState.subscribe(user => {
  if (user) {
    // Obtener datos del usuario de Firestore
    this.usuario$ = this.firestore.collection('usuarios').doc(user.uid).valueChanges();
  }
});

}

async realizarCompra() {
// Aquí puedes incluir la lógica para procesar los datos del nuevo viaje
// Por ejemplo, guardar el viaje en una base de datos
this.guardarDatosViaje(this.viaje)


}

async guardarDatosViaje(viaje: Viaje) {
  const user = await this.afAuth.currentUser;
  const userId = user?.uid;

  if (!userId) {
    console.error('No hay un usuario autenticado');
    return;
  }

  try {
    const usuarioDocRef = await this.firestore.collection('usuarios').doc(userId).get().toPromise();
    
    if (!usuarioDocRef || !usuarioDocRef.exists) {
      console.error('No se encontraron datos del usuario');
      return;
    }

    const usuarioDatos = usuarioDocRef.data() as UsuarioDatos; 
    if (!usuarioDatos) {
      console.error('No se pudo obtener los datos del usuario');
      return;
    }

    const viajeDatos = {
      destino: viaje.destino,
      horaSalida: viaje.horaSalida,
      pasajerosMaximos: viaje.pasajerosMaximos,
      tarifa: viaje.tarifa,
      fecha: viaje.fecha,
      patente: usuarioDatos.patente,
      conductor: usuarioDatos.firstname,
      email: usuarioDatos.email,
      suscriptores: []
    };

    const viajeRef = await this.firestore.collection('viajes').add(viajeDatos);
    console.log('Datos de viaje guardados en Firestore con ID:', viajeRef.id);
    // Aquí puedes hacer algo con viajeRef.id si es necesario

  } catch (error) {
    console.error('Error al obtener datos del usuario o guardar via en Firestore:', error);
  }
  }





actualizarHoraSalida(event: any) {
  const fechaSeleccionada: Date = new Date(event.detail.value);
  this.viaje.horaSalida = fechaSeleccionada.toISOString().substring(11, 16); // Formato "HH:mm"
}

}    