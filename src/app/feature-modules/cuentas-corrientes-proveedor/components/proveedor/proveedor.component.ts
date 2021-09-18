import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {ProveedoresService} from '../../../../services/proveedores.service';
import {Location} from '@angular/common';
import {Proveedor} from '../../../../models/proveedor';
import {CategoriaIVA} from '../../../../models/categoria-iva';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {Rol} from '../../../../models/rol';
import {AuthService} from '../../../../services/auth.service';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.scss']
})
export class ProveedorComponent implements OnInit {
  proveedor: Proveedor = null;
  form: FormGroup;
  submitted = false;

  categoriasIVA = [
    { value: CategoriaIVA.RESPONSABLE_INSCRIPTO, text: 'Responsable Inscripto'},
    { value: CategoriaIVA.EXENTO, text: 'Exento'},
    { value: CategoriaIVA.CONSUMIDOR_FINAL, text: 'Consumidor Final'},
    { value: CategoriaIVA.MONOTRIBUTO, text: 'Monotributo'},
  ];

  allowedRolesToCreateOrEdit: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCreateOrEdit = false;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private proveedoresService: ProveedoresService,
              private location: Location,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.hasRoleToCreateOrEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCreateOrEdit);
    if (!this.hasRoleToCreateOrEdit) {
      this.mensajeService.msg('No tiene permiso para ver el listado de proveedores.');
      this.router.navigate(['/']);
    }
    this.createForm();
    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.proveedoresService.getProveedor(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: (p: Proveedor) => {
            this.proveedor = p;
            this.populateForm();
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR).then(() => this.volverAlListado()),
        })
      ;
    }
  }

  volverAlListado() {
    this.location.back();
  }

  createForm() {
    this.form = this.fb.group({
      razonSocial: ['', Validators.required],
      idFiscal: '',
      categoriaIVA: [null, Validators.required],
      ubicacion: null,
      telPrimario: '',
      telSecundario: '',
      contacto: '',
      email:  ['', Validators.email],
      web: '',
    });
  }

  populateForm() {
    this.form.patchValue(this.proveedor);
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const proveedor = this.getProveedorFromValue();
      this.loadingOverlayService.activate();
      this.proveedoresService.guardarProveedor(proveedor)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: () => {
            this.mensajeService
              .msg('Los datos del proveedor fueron guardados exitosamente.', MensajeModalType.INFO)
              .then(() => { this.volverAlListado(); })
            ;
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }

  getProveedorFromValue(): Proveedor {
    const formValues = this.form.value;
    return {
      idProveedor: this.proveedor && this.proveedor.idProveedor ? this.proveedor.idProveedor : null,
      razonSocial: formValues.razonSocial,
      idFiscal: formValues.idFiscal,
      categoriaIVA: formValues.categoriaIVA,
      ubicacion: formValues.ubicacion,
      telPrimario: formValues.telPrimario,
      telSecundario: formValues.telSecundario,
      contacto: formValues.contacto,
      email: formValues.email,
      web: formValues.web
    };
  }
}
