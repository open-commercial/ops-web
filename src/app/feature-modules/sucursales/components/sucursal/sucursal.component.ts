import { NuevaSucursal } from './../../../../models/nueva-sucursal';
import { HelperService } from './../../../../services/helper.service';
import { CategoriaIVA } from './../../../../models/categoria-iva';
import { Sucursal } from './../../../../models/sucursal';
import { finalize } from 'rxjs/operators';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { SucursalesService } from './../../../../services/sucursales.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MensajeService } from 'src/app/services/mensaje.service';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-sucursal',
  templateUrl: './sucursal.component.html',
  styleUrls: ['./sucursal.component.scss']
})
export class SucursalComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  sucursal: Sucursal;

  loading = false;

  imageData: number[] = [];
  imageDataUrl = '';

  categoriasIVA = [
    { value: CategoriaIVA.RESPONSABLE_INSCRIPTO, text: 'Responsable Inscripto'},
    { value: CategoriaIVA.EXENTO, text: 'Exento'},
    { value: CategoriaIVA.CONSUMIDOR_FINAL, text: 'Consumidor Final'},
    { value: CategoriaIVA.MONOTRIBUTO, text: 'Monotributo'},
  ];

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private locaction: Location,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private sucursalesService: SucursalesService) {}

  ngOnInit(): void {
    this.createForm();

    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loading = true;
      this.loadingOverlayService.activate();
      this.sucursalesService.getSucursal(id)
        .pipe(finalize(() => {
          this.loading = false;
          this.loadingOverlayService.deactivate();
        }))
        .subscribe({
          next: s => {
            this.sucursal = s;
            this.loadData();

          },
          error: err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        })
      ;
    }
  }

  loadData() {
    this.form.patchValue(this.sucursal);
    this.imageDataUrl = this.sucursal ? this.sucursal.logo : '';
    this.form.get('fechaInicioActividad').setValue(
      HelperService.getNgbDateFromDate(this.sucursal.fechaInicioActividad)
    );
  }

  volverAlListado() {
    this.locaction.back();
  }

  createForm() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      lema: '',
      categoriaIVA: [null, Validators.required],
      idFiscal: null,
      ingresosBrutos: null,
      fechaInicioActividad: null,
      email: ['', Validators.required],
      telefono: '',
      ubicacion: [null, Validators.required],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const sucursal: NuevaSucursal|Sucursal = {
        nombre: formValues.nombre,
        categoriaIVA: formValues.categoriaIVA,
        email: formValues.email,
        ubicacion: formValues.ubicacion
      };

      if (formValues.lema) { sucursal.lema = formValues.lema; }
      if (formValues.idFiscal) { sucursal.idFiscal = formValues.idFiscal; }
      if (formValues.ingresosBrutos) { sucursal.ingresosBrutos = formValues.ingresosBrutos; }
      if (formValues.fechaInicioActividad) {
        sucursal.fechaInicioActividad = HelperService.getDateFromNgbDate(formValues.fechaInicioActividad);
      }
      if (formValues.telefono) { sucursal.telefono = formValues.telefono; }
      if (this.imageData && this.imageData.length > 0) {
        sucursal.imagen = this.imageData;
      }

      if (this.sucursal) {
        this.doUpdate(sucursal as Sucursal);
      } else {
        this.doPersist(sucursal as NuevaSucursal);
      }
    }
  }

  doPersist(sucursal: NuevaSucursal) {
    this.loadingOverlayService.activate();
    this.sucursalesService.persistSucursal(sucursal)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: () => this.mensajeService.msg('La sucursal se dió alta en forma exitosa.', MensajeModalType.INFO)
          .then(() => location.replace('/sucursales')),
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      })
    ;
  }

  doUpdate(sucursal: Sucursal) {
    sucursal.idSucursal = this.sucursal.idSucursal;
    this.loadingOverlayService.activate();
    this.sucursalesService.updateSucursal(sucursal)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: () => this.mensajeService.msg('Los datos de la sucursal se actualizaron en forma exitosa.', MensajeModalType.INFO)
        .then(() => location.replace('/sucursales')),
      error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      })
    ;
  }

  imageChange($event) {
    const file = $event.target.files[0];
    const readerBuffer = new FileReader();
    const readerDataUrl = new FileReader();

    readerBuffer.addEventListener('load', () => {
      const arr = new Uint8Array(readerBuffer.result as ArrayBuffer);
      this.imageData = Array.from(arr);
    });

    readerDataUrl.addEventListener('load', () => {
      this.imageDataUrl = readerDataUrl.result as string;
    });

    readerBuffer.readAsArrayBuffer(file);
    readerDataUrl.readAsDataURL(file);
  }

  imageClear() {
    this.imageData = [];
    this.imageDataUrl = this.sucursal ? this.sucursal.logo : '';
  }

  getImageUrl(): string {
    const url = this.sucursal ? this.sucursal.logo : this.imageDataUrl;
    return url;
  }
}
