import {Component, OnInit} from '@angular/core';
import {Cliente} from '../../models/cliente';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CategoriaIVA} from '../../models/categoria-iva';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {Location} from '@angular/common';
import {Rol} from '../../models/rol';
import {ClientesService} from '../../services/clientes.service';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {ActivatedRoute} from '@angular/router';
import {UFProfile} from '../usuario-form/usuario-form.component';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {
  cliente: Cliente = null;
  form: FormGroup;
  submitted = false;

  categoriasIVA = [
    { value: CategoriaIVA.RESPONSABLE_INSCRIPTO, text: 'Responsable Inscripto'},
    { value: CategoriaIVA.EXENTO, text: 'Exento'},
    { value: CategoriaIVA.CONSUMIDOR_FINAL, text: 'Consumidor Final'},
    { value: CategoriaIVA.MONOTRIBUTO, text: 'Monotributo'},
  ];

  rol = Rol;

  ufProfile = UFProfile.CLIENTE;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private clientesService: ClientesService,
              private location: Location
              ) { }

  ngOnInit() {
    this.createForm();
    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.clientesService.getCliente(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          cliente => {
            this.cliente = cliente;
            this.populateForm();
          },
          err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR)
              .then(() => this.volverAlListado());
          }
        )
      ;
    }
  }

  volverAlListado() {
    this.location.back();
  }

  createForm() {
    this.form = this.fb.group({
      puedeComprarAPlazo: false,
      montoCompraMinima: [0, Validators.min(0)],
      nombreFiscal: ['', Validators.required],
      nombreFantasia: '',
      idFiscal: '',
      categoriaIVA: [null, Validators.required],
      idViajante: null,
      telefono: ['', Validators.required],
      contacto: '',
      email: ['', Validators.email],
      idCredencial: [null, Validators.required],
      ubicacionFacturacion: null,
      ubicacionEnvio: null
    });
  }

  populateForm() {
    this.form.patchValue(this.cliente);
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const cliente = this.getClienteFromValues();
      const observable = cliente.idCliente ? this.clientesService.updateCliente(cliente)
        : this.clientesService.createCliente(cliente);

      this.loadingOverlayService.activate();
      observable
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          () => {
            this.mensajeService
              .msg('Los datos del cliente fueron guardados exitosamente.', MensajeModalType.INFO)
              .then(() => { this.volverAlListado(); })
            ;
          },
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        )
      ;
    }
  }

  getClienteFromValues(): Cliente {
    const formValues = this.form.value;
    return {
      idCliente: this.cliente && this.cliente.idCliente ? this.cliente.idCliente : null,
      // nroCliente: this.cliente && this.cliente.nroCliente ? this.cliente.nroCliente : null,
      nombreFiscal: formValues.nombreFiscal,
      nombreFantasia: formValues.nombreFantasia,
      categoriaIVA: formValues.categoriaIVA,
      idFiscal: formValues.idFiscal,
      ubicacionFacturacion: formValues.ubicacionFacturacion,
      ubicacionEnvio: formValues.ubicacionEnvio,
      email: formValues.email,
      telefono: formValues.telefono,
      contacto: formValues.contacto,
      // fechaAlta: this.cliente && this.cliente.fechaAlta ? this.cliente.fechaAlta : null,
      idViajante: formValues.idViajante,
      // nombreViajante: '',
      idCredencial: formValues.idCredencial,
      // nombreCredencial: '',
      predeterminado: this.cliente && this.cliente.predeterminado ? this.cliente.predeterminado : false,
      // saldoCuentaCorriente: number,
      montoCompraMinima: formValues.montoCompraMinima,
      // detalleUbicacionDeFacturacion: string,
      // detalleUbicacionDeEnvio: string,
      puedeComprarAPlazo: formValues.puedeComprarAPlazo,
    };
  }
}
