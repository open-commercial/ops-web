import { finalize } from 'rxjs/operators';
import { MedidasService } from './../../../../services/medidas.service';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { MensajeService } from './../../../../services/mensaje.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './../../../../services/auth.service';
import { Medida } from './../../../../models/medida';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Rol } from './../../../../models/rol';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-medida',
  templateUrl: './medida.component.html',
  styleUrls: ['./medida.component.scss']
})
export class MedidaComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  medida: Medida;

  allowedRolesToManageMedidas: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToManageMedidas = false;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private location: Location,
              private authService: AuthService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private medidasService: MedidasService) { }

  ngOnInit(): void {
    this.createForm();
    this.hasRoleToManageMedidas = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToManageMedidas);

    if (this.route.snapshot.paramMap.has('id')) {
      if (!this.hasRoleToManageMedidas) {
        this.mensajeService.msg('Ud. no tiene permisos para dar de editar medidas.', MensajeModalType.ERROR);
        this.volverAlListado();
        return;
      }

      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.medidasService.getMedida(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: medida => {
            this.medida = medida;
            this.form.patchValue(this.medida);
          },
          error: err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          },
        })
      ;

    } else {
      if (!this.hasRoleToManageMedidas) {
        this.mensajeService.msg('Ud. no tiene permisos para dar de alta medidas.', MensajeModalType.ERROR);
        this.volverAlListado();
      }
    }
  }

  volverAlListado() {
    this.location.back();
  }

  createForm() {
    this.form = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const medida: Medida = {
        idMedida: this.medida ? this.medida.idMedida : null,
        nombre: formValues.nombre,
      }

      this.loadingOverlayService.activate();
      this.medidasService.guardarMedida(medida)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: () => {
            this.mensajeService.msg('Los datos de la medida se han guardado correctamente.', MensajeModalType.INFO);
            this.volverAlListado();
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
