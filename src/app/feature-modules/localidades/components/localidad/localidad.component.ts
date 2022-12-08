import { AuthService } from './../../../../services/auth.service';
import { Rol } from './../../../../models/rol';
import { Localidad } from './../../../../models/localidad';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UbicacionesService } from './../../../../services/ubicaciones.service';
import { MensajeService } from 'src/app/services/mensaje.service';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-localidad',
  templateUrl: './localidad.component.html',
  styleUrls: ['./localidad.component.scss']
})
export class LocalidadComponent implements OnInit {
  form: UntypedFormGroup;
  submitted = false;
  localidad: Localidad;

  allowedRolesToEdit = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToEdit = false;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private fb: UntypedFormBuilder,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private authService: AuthService,
              private ubicacionService: UbicacionesService) { }

  ngOnInit(): void {
    this.createForm();
    this.hasRoleToEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEdit);
    if (!this.hasRoleToEdit) {
      this.mensajeService.msg('Ud. no tiene permisos para editar localidades.', MensajeModalType.ERROR);
      this.volverAlListado();
      return;
    }

    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.ubicacionService.getLocalidad(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: localidad => {
            this.localidad = localidad;
            this.form.patchValue(this.localidad);
          },
          error: err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        })
    } else {
      this.mensajeService.msg('No ha especificado la localidad');
      this.volverAlListado();
    }
  }

  volverAlListado() {
    this.location.back();
  }

  createForm() {
    this.form = this.fb.group({
      codigoPostal: '',
      envioGratuito: null,
      costoEnvio: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const localidad = { ...this.localidad };

      localidad.codigoPostal = formValues.codigoPostal;
      localidad.envioGratuito = formValues.envioGratuito;
      localidad.costoEnvio = formValues.costoEnvio;

      this.loadingOverlayService.activate();
      this.ubicacionService.updateLocalidad(localidad)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: () => {
            this.mensajeService.msg('Los datos de la localidad han sido guardados con éxito.', MensajeModalType.INFO);
            this.volverAlListado();
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        })
      ;
    }
  }
}
