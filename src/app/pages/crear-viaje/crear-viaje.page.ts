import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { RegistroUsuario } from 'src/app/interface';
import { UsuarioDatos, Viaje } from 'src/app/viaje-interface';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {
  usuario$: Observable<any> | undefined; 

  viaje: Viaje = {
    destino: '',
    horaSalida: '',
    pasajerosMaximos: 0,
    tarifa: 0,
    fecha: new Date(),
    patente: '',
    conductor: '',
    email: '',
    suscriptores: null,
    pasajerosActuales: 0
  };

  constructor(
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    console.log("Componente de Crear Viaje inicializado");

    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.usuario$ = this.firestore.collection('usuarios').doc(user.uid).valueChanges();
      }
    });
  }

  async realizarCompra() {
    const puedeCrearViaje = await this.verificarEstadoUsuario();
    if (puedeCrearViaje && this.viaje.horaSalida) {
      this.guardarDatosViaje(this.viaje);
    } else {
      this.mostrarAlertaHoraSalida(); 
      console.error('El usuario no está autorizado para crear viajes');
      // Mostrar un mensaje al usuario o manejar la restricción
    }
  }

  async verificarEstadoUsuario(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const usuarioDocRef = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
  
      if (usuarioDocRef && usuarioDocRef.exists) {
        const usuarioDatos = usuarioDocRef.data() as RegistroUsuario;
        return usuarioDatos.estado !== false; // Devuelve true si el estado del usuario no es false
      }
    }
    return false; // Devuelve false si no hay usuario o no se encontró el documento
  }
  

  async guardarDatosViaje(viaje: Viaje) {
    const user = await this.afAuth.currentUser;
    const userId = user?.uid;
  
    if (!userId) {
      console.error('No hay un usuario autenticado');
      return;
    }
    
    if (!viaje.destino) {
      console.error('El destino no puede estar vacío');
      this.mostrarAlerta('El destino no puede estar vacío');
      return;
    }
  
    // Validaciones para tarifa y número de pasajeros
    if (viaje.tarifa < 100 || viaje.tarifa > 1000) {
      console.error('La tarifa debe estar entre 100 y 1000');
      this.mostrarAlerta('La tarifa debe estar entre 100 y 1000');
      return;
    }
  
    if (viaje.pasajerosMaximos <= 0 || viaje.pasajerosMaximos > 12) {
      console.error('El número de pasajeros debe ser mayor a 0 y menor o igual a 12');
      this.mostrarAlerta('El número de pasajeros debe ser mayor a 0 y menor o igual a 12');
      return;
    }
  
    // Convertir la hora de salida a un objeto Date
    const fechaHoraSalida = new Date(viaje.fecha);
    const [hora, minuto] = viaje.horaSalida.split(':').map(Number);
    fechaHoraSalida.setUTCHours(hora, minuto, 0);
  
    // Obtener la fecha y hora actual
    const ahora = new Date();
  
    // Comprobar si la hora de salida es anterior a la hora actual
    if (fechaHoraSalida <= ahora) {
      console.error('La hora de salida no puede ser anterior a la hora actual');
      this.mostrarAlertaHoraInvalida();
      return;
    }
  
    try {
      const usuarioDocRef = await this.firestore.collection('usuarios').doc(userId).get().toPromise();
  
      if (!usuarioDocRef || !usuarioDocRef.exists) {
        console.error('No se encontraron datos del usuario');
        return;
      }
  
      const usuarioDatos = usuarioDocRef.data() as UsuarioDatos; 
  
      const viajeDatos = {
        destino: viaje.destino,
        horaSalida: viaje.horaSalida,
        pasajerosMaximos: viaje.pasajerosMaximos,
        tarifa: viaje.tarifa,
        fecha: viaje.fecha,
        patente: usuarioDatos.patente,
        conductor: usuarioDatos.firstname,
        email: usuarioDatos.email,
        suscriptores: [],
        pasajerosActuales: 0
      };
  
      const viajeRef = await this.firestore.collection('viajes').add(viajeDatos);
      console.log('Datos de viaje guardados en Firestore con ID:', viajeRef.id);
  
      await this.firestore.collection('usuarios').doc(userId).update({ estado: false });
      console.log('Estado del usuario actualizado a false');
      this.mostrarAlertaExito();
      this.router.navigate(['/viaje-actual']); // Redirigir a 'viaje-actual' después de crear el viaje
    } catch (error) {
      console.error('Error al obtener datos del usuario o guardar viaje en Firestore:', error);
    }
  }
  
  // Métodos para mostrar alertas
  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Advertencia',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
  
  async mostrarAlertaHoraInvalida() {
    const alert = await this.alertController.create({
      header: 'Hora Inválida',
      message: 'La hora de salida no puede ser anterior a la hora actual.',
      buttons: ['OK']
    });
    await alert.present();
  }
  
  
  actualizarHoraSalida(event: any) {
    const fechaSeleccionada: Date = new Date(event.detail.value);
    this.viaje.horaSalida = fechaSeleccionada.toISOString().substring(11, 16);
  }

  async mostrarAlertaHoraSalida() {
    const alert = await this.alertController.create({
      header: 'Hora de Salida Requerida',
      message: 'Debe designar una hora de salida para el viaje.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async mostrarAlertaExito() {
    const alert = await this.alertController.create({
      header: 'Viaje creado',
      message: 'Su viaje ha sido creado con éxito.',
      buttons: ['OK']
    });

    await alert.present();
  }

}


