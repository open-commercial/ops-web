import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from './../../../../services/auth.service';
import { Rol } from './../../../../models/rol';
import { MensajeService } from 'src/app/services/mensaje.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { RubrosService } from './../../../../services/rubros.service';
import { Location } from '@angular/common';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { Rubro } from './../../../../models/rubro';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

const svgValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value || '').trim();
  if (!value) { return null; }

  const doc = new DOMParser().parseFromString(value, 'image/svg+xml');
  if (doc.querySelector('parsererror')) {
    return { svgInvalido: true };
  }

  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg') {
    return { svgRequerido: true };
  }

  if (root.querySelector('script, foreignObject')) {
    return { svgNoPermitido: true };
  }

  const elementos = [root, ...Array.from(root.querySelectorAll('*'))];
  const tieneAtributoNoPermitido = elementos.some(el =>
    Array.from(el.attributes).some(attr => {
      const nombre = attr.name.toLowerCase();
      return nombre.startsWith('on') || (nombre === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:'));
    })
  );

  return tieneAtributoNoPermitido ? { svgNoPermitido: true } : null;
};

@Component({
  selector: 'app-rubro',
  templateUrl: './rubro.component.html',
  styleUrls: ['./rubro.component.scss']
})
export class RubroComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  rubro: Rubro;
  submitted = false;
  svgPreview: SafeHtml = null;
  private subscription = new Subscription();

  allowedRolesToCreate = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToCreate = false;

  allowedRolesToUpdate = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToUpdate = false;

  constructor(private route: ActivatedRoute,
              private fb: UntypedFormBuilder,
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
      imagenHtml: ['', svgValidator],
    });

    const imagenHtmlControl = this.form.get('imagenHtml');
    this.subscription.add(
      imagenHtmlControl.valueChanges.subscribe(() => this.actualizarPreview(imagenHtmlControl))
    );
  }

  private actualizarPreview(control: AbstractControl) {
    const value = (control.value || '').trim();
    this.svgPreview = value && control.valid ? this.sanitizer.bypassSecurityTrustHtml(value) : null;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
            this.volverAlListado();
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        });
    }
  }
}
