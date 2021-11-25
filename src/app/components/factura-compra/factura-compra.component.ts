import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {Location} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {FacturasCompraService} from '../../services/facturas-compra.service';
import {debounceTime, finalize} from 'rxjs/operators';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {HelperService} from '../../services/helper.service';
import {RenglonFactura} from '../../models/renglon-factura';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NuevoRenglonFacturaModalComponent} from '../nuevo-renglon-factura-modal/nuevo-renglon-factura-modal.component';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevoRenglonFactura} from '../../models/nuevo-renglon-factura';
import {Subscription} from 'rxjs';
import {FacturasService} from '../../services/facturas.service';
import {NuevosResultadosComprobante} from '../../models/nuevos-resultados-comprobante';
import {Resultados} from '../../models/resultados';
import {StorageKeys, StorageService} from '../../services/storage.service';
import {NuevaFacturaCompra} from '../../models/nueva-factura-compra';
import {SucursalesService} from '../../services/sucursales.service';
import {Rol} from '../../models/rol';

@Component({
  selector: 'app-factura-compra',
  templateUrl: './factura-compra.component.html',
  styleUrls: ['./factura-compra.component.scss']
})
export class FacturaCompraComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted = false;
  helper = HelperService;

  tiposDeComprobantes: TipoDeComprobante[] = [];
  subscription: Subscription;

  resultados: Resultados = {
    descuentoPorcentaje: 0,
    descuentoNeto: 0,
    recargoPorcentaje: 0,
    iva21Neto: 0,
    iva105Neto: 0,
    recargoNeto: 0,
    subTotal: 0,
    subTotalBruto: 0,
    total: 0,
  };

  allowedRolesToCrearFactura: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearFactura = false;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private loadingOverlayService: LoadingOverlayService,
              private modalService: NgbModal,
              private mensajeService: MensajeService,
              private location: Location,
              private authService: AuthService,
              private storageService: StorageService,
              private facturasService: FacturasService,
              private sucursalesService: SucursalesService,
              private facturasCompraService: FacturasCompraService) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.hasRoleToCrearFactura = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearFactura);
    if (!this.hasRoleToCrearFactura) {
      this.mensajeService.msg('No tiene permiso para crear una factura de compra.');
      this.router.navigate(['/']);
    }
    this.createForm();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  volverAlListado() {
    this.location.back();
  }

  getTiposDeComprobantes(idProveedor: number) {
    this.loadingOverlayService.activate();
    this.facturasCompraService.getTiposDeComprobante(idProveedor)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(data => this.tiposDeComprobantes = data)
    ;
  }

  loadLSData() {
    const data = this.storageService.getItem(StorageKeys.FACTURA_COMPRA_NUEVA);
    if (data) {
      const renglonesCopy = data.renglones.map(d => d.renglonFactura);
      delete data.renglones;
      this.form.patchValue(data);
      renglonesCopy.forEach(rf => this.addRenglon(rf));
    }
  }

  clearLSData() {
    this.storageService.removeItem(StorageKeys.FACTURA_COMPRA_NUEVA);
  }

  createForm() {
    this.form = this.fb.group({
      idProveedor: [null, Validators.required],
      tipoDeComprobante: [null, Validators.required],
      idTransportista: null,
      numSerie: [0, [Validators.required, Validators.min(0)]],
      numFactura: [0, [Validators.required, Validators.min(0)]],
      fecha: ['', Validators.required],
      fechaVencimiento: null,
      renglones: this.fb.array([], [Validators.required]),
      observaciones: '',
      recargoPorcentaje: [0, Validators.min(0)],
      descuentoPorcentaje: [0, Validators.min(0)],
    });

    this.subscription.add(this.form.valueChanges
      .subscribe(value => this.storageService.setItem(StorageKeys.FACTURA_COMPRA_NUEVA, value))
    );

    this.subscription.add(this.form.get('idProveedor').valueChanges
      .subscribe(value => {
        this.form.get('tipoDeComprobante').setValue(null);
        if (!value) { this.tiposDeComprobantes = []; return; }
        this.getTiposDeComprobantes(value);
      })
    );

    this.subscription.add(this.form.get('tipoDeComprobante').valueChanges
      .subscribe(value => {
        if (value) { this.refreshRenglones(value); }
      })
    );

    this.subscription.add(this.form.get('recargoPorcentaje').valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this.refreshResultados())
    );

    this.loadLSData();

    this.subscription.add(this.form.get('descuentoPorcentaje').valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this.refreshResultados())
    );
  }

  get f() { return this.form.controls; }

  get renglones() {
    return this.form.get('renglones') as FormArray;
  }

  checkProveedorYTipoComprobante(): boolean {
    const idProveedor = this.form.get('idProveedor').value;
    const tc = this.form.get('tipoDeComprobante').value;
    if (!idProveedor) {
      this.mensajeService.msg('Debe seleccionar un Proveedor.', MensajeModalType.INFO);
      return false;
    }
    if (!tc) {
      this.mensajeService.msg('Debe seleccionar un tipo de Comprobante.', MensajeModalType.INFO);
      return false;
    }

    return true;
  }

  showNuevoReglonFacturaModal() {
    if (!this.checkProveedorYTipoComprobante()) {
      return;
    }

    const tc = this.form.get('tipoDeComprobante').value;

    const modalRef = this.modalService.open(NuevoRenglonFacturaModalComponent, { backdrop: 'static', size: 'lg' });
    modalRef.result.then((nrf: NuevoRenglonFactura) => {
      this.loadingOverlayService.activate();
      this.facturasCompraService.calcularRenglones([nrf], tc)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: (data: RenglonFactura[]) => {
            this.addRenglon(data[0]);
            this.refreshResultados();
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }, () => { return; });
  }

  addRenglon(rf: RenglonFactura) {
    this.renglones.push(this.fb.group({ renglonFactura: rf }));
  }

  removeRenglon(i: number) {
    this.renglones.controls.splice(i, 1);
    this.refreshResultados();
  }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const nfc: NuevaFacturaCompra = {
        idSucursal: this.sucursalesService.getIdSucursal(),
        idProveedor: formValues.idProveedor,
        idTransportista: Number(formValues.idTransportista),
        numSerie: formValues.numSerie,
        numFactura: formValues.numFactura,
        fecha: this.helper.getDateFromNgbDate(formValues.fecha),
        fechaVencimiento: this.helper.getDateFromNgbDate(formValues.fechaVencimiento),
        tipoDeComprobante: formValues.tipoDeComprobante,
        observaciones: formValues.observaciones,
        renglones: formValues.renglones.map((r => {
          const rf: RenglonFactura = r.renglonFactura;
          return { idProducto: rf.idProductoItem,
            cantidad: rf.cantidad,
            bonificacion: rf.bonificacionPorcentaje
          };
        })),
        recargoPorcentaje: formValues.recargoPorcentaje,
        descuentoPorcentaje: formValues.descuentoPorcentaje,
      };

      this.loadingOverlayService.activate();
      this.facturasCompraService.guardarFacturaCompa(nfc)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: () => { this.clearLSData(); this.volverAlListado(); },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }

  refreshRenglones(tc: TipoDeComprobante) {
    if (this.renglones.length) {
      const renglones: NuevoRenglonFactura[] = this.renglones.controls.map(rForm => {
        const rf: RenglonFactura = rForm.get('renglonFactura').value;
        return  {
          idProducto: rf.idProductoItem,
          cantidad: rf.cantidad,
          bonificacion: rf.bonificacionPorcentaje
        };
      });
      this.loadingOverlayService.activate();
      this.facturasCompraService.calcularRenglones(renglones, tc)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: data => {
            this.renglones.clear();
            data.forEach(rf => this.addRenglon(rf));
            this.refreshResultados();
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        })
      ;
    } else {
      this.refreshResultados();
    }
  }

  refreshResultados() {
    const tc = this.form.get('tipoDeComprobante').value;
    if (!tc) { return false; }

    let dp = this.form.get('descuentoPorcentaje').value;
    let rp = this.form.get('recargoPorcentaje').value;
    dp = dp || 0;
    rp = rp || 0;

    if (dp < 0) {
      this.mensajeService.msg('El % de descuento debe ser un número mayor o igual a 0');
      return;
    }

    if (rp < 0) {
      this.mensajeService.msg('El % de recargo debe ser un número mayor o igual a 0');
      return;
    }

    const nrf: NuevosResultadosComprobante = {
      importe: this.renglones.controls.map(r => r.get('renglonFactura').value.importe),
      cantidades: this.renglones.controls.map(r => r.get('renglonFactura').value.cantidad),
      ivaNetos: this.renglones.controls.map(r => r.get('renglonFactura').value.ivaNeto),
      ivaPorcentajes: this.renglones.controls.map(r => r.get('renglonFactura').value.ivaPorcentaje),
      descuentoPorcentaje: dp,
      recargoPorcentaje: rp,
      tipoDeComprobante: tc,
    };

    this.facturasService.calcularResultadosFactura(nrf)
      .subscribe({
        next: res => this.resultados = res,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
