import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from './../../../../services/auth.service';
import { Rol } from './../../../../models/rol';
import { MensajeService } from 'src/app/services/mensaje.service';
import { finalize } from 'rxjs/operators';
import { RubrosService } from './../../../../services/rubros.service';
import { Location } from '@angular/common';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { Rubro } from './../../../../models/rubro';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-rubro',
  templateUrl: './rubro.component.html'
})
export class RubroComponent implements OnInit {
  form: FormGroup;
  rubro: Rubro;
  submitted = false;

  allowedRolesToCreate = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToCreate = false;

  allowedRolesToUpdate = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToUpdate = false;

  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private location: Location,
              public sanitizer: DomSanitizer,
              private authService: AuthService,
              private rubrosService: RubrosService) { }

  ngOnInit(): void {
    this.createForm();
    this.hasRoleToCreate = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCreate);
    this.hasRoleToUpdate = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToUpdate);

    if (this.route.snapshot.paramMap.has('id')) {
      if (!this.hasRoleToUpdate) {
        this.mensajeService.msg('Ud. no tiene permisos para editar rubros.', MensajeModalType.ERROR);
        this.volverAlListado();
        return;
      }

      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.rubrosService.getRubro(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: r => {
            this.rubro = r;
            this.form.patchValue(this.rubro);
          },
          error: err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          },
        })
      ;
    } else {
      if (!this.hasRoleToCreate) {
        this.mensajeService.msg('Ud. no tiene permisos para crear rubros.', MensajeModalType.ERROR);
        this.volverAlListado();
      }
    }
  }

  volverAlListado() {
    this.location.back();
  }

  createForm() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      imagenHtml: '',
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const r: Rubro = {
        nombre: formValues.nombre,
        imagenHtml: formValues.imagenHtml,
      }
      if (this.rubro) { r.idRubro = this.rubro.idRubro }
      this.loadingOverlayService.activate();
      this.rubrosService.guardarRubo(r)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: () => {
            this.mensajeService.msg('Los datos del rubro se guardaron correctamente.', MensajeModalType.INFO);
            this.volverAlListado();
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
