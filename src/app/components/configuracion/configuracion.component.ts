import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SucursalesService} from '../../services/sucursales.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfiguracionSucursal} from '../../models/configuracion-sucursal';
import {ConfiguracionesSucursalService} from '../../services/configuraciones-sucursal.service';
import {finalize} from 'rxjs/operators';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {Router} from '@angular/router';
import {Sucursal} from '../../models/sucursal';
import {Subscription} from 'rxjs';
import {Rol} from '../../models/rol';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html'
})
export class ConfiguracionComponent implements OnInit, OnDestroy {
  form: FormGroup;
  sucursal: Sucursal;
  configuracion: ConfiguracionSucursal;
  submitted = false;

  allowedRolesToEdit: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToEdit = false;

  subscription: Subscription;

  disabledInputFile = false;

  @ViewChild('fileInputLabel') fileInputLabel: ElementRef<HTMLLabelElement>;

  constructor(private sucursalesService: SucursalesService,
              private configuracionesSucursalService: ConfiguracionesSucursalService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private router: Router,
              private fb: FormBuilder,
              private authService: AuthService) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.hasRoleToEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEdit);
    if (!this.hasRoleToEdit) {
      this.mensajeService.msg('No tiene permisos para editar la configuración de sucursal');
      this.router.navigate(['/']);
      return;
    }
    this.createForm();
    this.loadSucursalConfiguration();
    this.subscription.add(this.sucursalesService.sucursal$.subscribe(() => this.loadSucursalConfiguration()));
  }

  loadSucursalConfiguration() {
    this.loadingOverlayService.activate();
    this.sucursalesService.getSucursal(this.sucursalesService.getIdSucursal())
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: s => {
          this.sucursal = s;
          this.configuracion = this.sucursal.configuracionSucursal;
          this.updateFormValues();
        },
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.router.navigate(['/']);
        }
      })
    ;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateFormValues() {
    this.form.patchValue(this.configuracion);
    this.form.get('vencimientoCorto').setValue(this.configuracion.vencimientoCorto / 60);
    this.form.get('vencimientoLargo').setValue(this.configuracion.vencimientoLargo / 60);
  }

  createForm() {
    this.form = this.fb.group({
      usarFacturaVentaPreImpresa: false,
      cantidadMaximaDeRenglonesEnFactura: [500, [Validators.required, Validators.min(100)]],
      facturaElectronicaHabilitada: false,
      certificadoAfip: null,
      firmanteCertificadoAfip: ['', Validators.required],
      passwordCertificadoAfip: '',
      nroPuntoDeVentaAfip: [null, [Validators.required, Validators.min(1)]],
      puntoDeRetiro: false,
      predeterminada: false,
      vencimientoCorto: [1, [Validators.required, Validators.min(1)]],
      vencimientoLargo: [1, [Validators.required, Validators.min(1)]],
      comparteStock: false,
    });

    this.form.get('facturaElectronicaHabilitada').valueChanges.subscribe({
      next: value => {
        this.disabledInputFile = !value;
        if (value) {
          this.form.get('certificadoAfip').enable();
          this.form.get('firmanteCertificadoAfip').enable();
          this.form.get('passwordCertificadoAfip').enable();
          this.form.get('nroPuntoDeVentaAfip').enable();
        } else {
          this.form.get('certificadoAfip').disable();
          this.form.get('firmanteCertificadoAfip').disable();
          this.form.get('passwordCertificadoAfip').disable();
          this.form.get('nroPuntoDeVentaAfip').disable();
        }
      }
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const configuracion: ConfiguracionSucursal = {
        idSucursal: this.sucursal.idSucursal,
        idConfiguracionSucursal: this.configuracion.idConfiguracionSucursal,
        usarFacturaVentaPreImpresa: formValues.usarFacturaVentaPreImpresa,
        cantidadMaximaDeRenglonesEnFactura: formValues.cantidadMaximaDeRenglonesEnFactura,
        facturaElectronicaHabilitada: formValues.facturaElectronicaHabilitada,
        puntoDeRetiro: formValues.puntoDeRetiro,
        predeterminada: formValues.predeterminada,
        vencimientoCorto: formValues.vencimientoCorto * 60,
        vencimientoLargo: formValues.vencimientoLargo * 60,
        comparteStock: formValues.comparteStock,
      };

      if (formValues.facturaElectronicaHabilitada) {
        configuracion.certificadoAfip = !this.disabledInputFile && formValues.certificadoAfip && formValues.certificadoAfip.length
          ? formValues.certificadoAfip : null;
        configuracion.firmanteCertificadoAfip = formValues.firmanteCertificadoAfip;
        configuracion.passwordCertificadoAfip = formValues.passwordCertificadoAfip;
        configuracion.nroPuntoDeVentaAfip = formValues.nroPuntoDeVentaAfip;
      }

      this.loadingOverlayService.activate();
      this.configuracionesSucursalService.updateConfiguracionSucursal(configuracion)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: () => {
            this.loadSucursalConfiguration();
            this.mensajeService.msg('La configuración fue actualizada exitosamente.', MensajeModalType.INFO);
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }

  fileChange($event) {
    const file = $event.target.files[0];
    const readerBuffer = new FileReader();
    const fileParts = $event.target.value.split('\\');
    const fileName = fileParts[fileParts.length - 1];

    if (fileName) {
      this.fileInputLabel.nativeElement.innerHTML = fileName;
    }

    readerBuffer.addEventListener('load', () => {
      const arr = new Uint8Array(readerBuffer.result as ArrayBuffer);
      this.form.get('certificadoAfip').setValue(Array.from(arr));
    });

    if (file) {
      readerBuffer.readAsArrayBuffer(file);
    }
  }
}
