import { FormasDePagoService } from './../../services/formas-de-pago.service';
import { FormaDePago } from './../../models/forma-de-pago';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FacturasService } from '../../services/facturas.service';
import { HelperService } from '../../services/helper.service';
import { NgbAccordion, NgbAccordionConfig, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { debounceTime, finalize } from 'rxjs/operators';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { CuentasCorrientesService } from '../../services/cuentas-corrientes.service';
import { RenglonFactura } from '../../models/renglon-factura';
import { FacturasVentaService } from '../../services/facturas-venta.service';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';
import { SucursalesService } from '../../services/sucursales.service';
import { NuevosResultadosComprobante } from '../../models/nuevos-resultados-comprobante';
import { Resultados } from '../../models/resultados';
import { NuevaFacturaVenta } from '../../models/nueva-factura-venta';
import { StorageKeys, StorageService } from '../../services/storage.service';
import { PedidosService } from '../../services/pedidos.service';
import { EstadoPedido } from '../../models/estado-pedido';
import { Pedido } from '../../models/pedido';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { FacturaVenta } from '../../models/factura-venta';
import { Transportista } from '../../models/transportista';
import { Subscription, combineLatest } from 'rxjs';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { Rol } from '../../models/rol';

@Component({
  selector: 'app-factura-venta',
  templateUrl: './factura-venta.component.html',
  styleUrls: ['./factura-venta.component.scss']
})
export class FacturaVentaComponent implements OnInit, OnDestroy {
  title = '';
  form: UntypedFormGroup;
  submitted = false;
  loading = false;
  helper = HelperService;
  localStorageKey = StorageKeys.PEDIDO_FACTURAR;
  tiposDeComprobanteLabesForCombo: { val: TipoDeComprobante, text: string }[] = [];
  loadingResultados = false;
  resultados: Resultados;
  recalculandoRenglones = false;
  verificandoPedido = false;
  pedido: Pedido = null;
  saving = false;
  transportistaSeleccionado: Transportista = null;
  checkingAll = false;
  checkingRenglon = false;
  subscription: Subscription;
  usuario: Usuario = null;
  formasDePago: FormaDePago[] = [];
  formaDePagoPredeterminada: FormaDePago;

  tiposDeComprobanteLabels = [
    { val: TipoDeComprobante.FACTURA_A,   text: 'Factura A'   },
    { val: TipoDeComprobante.FACTURA_B,   text: 'Factura B'   },
    { val: TipoDeComprobante.FACTURA_C,   text: 'Factura C'   },
    { val: TipoDeComprobante.FACTURA_X,   text: 'Factura X'   },
    { val: TipoDeComprobante.FACTURA_Y,   text: 'Factura Y'   },
    { val: TipoDeComprobante.PRESUPUESTO, text: 'Presupuesto' }
  ];

  @ViewChild('accordion') accordion: NgbAccordion;
  @ViewChild('checkAllToggler') checkAllToggler: ElementRef;  

  constructor(modalConfig: NgbModalConfig,
              accordionConfig: NgbAccordionConfig,
              private readonly fb: UntypedFormBuilder,
              private readonly facturasService: FacturasService,
              private readonly facturasVentaService: FacturasVentaService,
              private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly location: Location,
              private readonly cuentasCorrienteService: CuentasCorrientesService,
              private readonly mensajeService: MensajeService,
              private readonly sucursalesService: SucursalesService,
              private readonly storageService: StorageService,
              private readonly pedidosService: PedidosService,
              public loadingOverlayService: LoadingOverlayService,
              public formasDePagoService: FormasDePagoService,
              public authService: AuthService) {
    accordionConfig.type = 'dark';
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.createFrom();

    const obvs = [
      this.authService.getLoggedInUsuario(),
      this.formasDePagoService.getFormasDePago(),
      this.formasDePagoService.getFormaDePagoPredeterminada(),
    ];

    this.loadingOverlayService.activate();
    combineLatest(obvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (data: [Usuario, FormaDePago[], FormaDePago]) => {
          this.usuario = data[0];
          this.formasDePago = data[1];
          this.formaDePagoPredeterminada = data[2];
          this.verificarPedido();
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      });

    this.subscription.add(this.sucursalesService.sucursal$.subscribe(() => this.getTiposDeComprobante()));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  verificarPedido() {
    const idPedido = this.route.snapshot.paramMap.has('id')
      ? Number(this.route.snapshot.paramMap.get('id'))
      : null;
    if (idPedido && idPedido > 0) {
      this.loadingOverlayService.activate();
      this.pedidosService.getPedido(idPedido)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          (p: Pedido) => {
            if ([EstadoPedido.ABIERTO].indexOf(p.estado) >= 0) {
              this.pedido = p;
              this.checkAndLoadDataForForm();
            } else {
              this.mensajeService.msg(`Estado de pedido Inválido (${p.estado})`, MensajeModalType.ERROR)
                .then(() => this.router.navigate(['/pedidos']))
              ;
            }
          },
          e => {
            this.mensajeService.msg(e.error, MensajeModalType.ERROR)
              .then(() => this.router.navigate(['/pedidos']))
            ;
          }
        )
      ;
    } else {
      this.mensajeService.msg('No es un pedido válido', MensajeModalType.ERROR)
        .then(() => this.router.navigate(['/pedidos']))
      ;
    }
  }

  checkAndLoadDataForForm() {
    if (this.pedido) {
      this.localStorageKey = StorageKeys.PEDIDO_FACTURAR;
      let data = this.storageService.getItem(this.localStorageKey);
      if (!data || !data.idPedido || data.idPedido !== this.pedido.idPedido) {
        data = this.getDefaultEmptyDataForForm();
        data.idPedido = this.pedido.idPedido;
        data.descuento = this.pedido.descuentoPorcentaje;
        data.recargo = this.pedido.recargoPorcentaje;
        this.loadingOverlayService.activate();
        this.cuentasCorrienteService.getCuentaCorrienteCliente(this.pedido.cliente.idCliente)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: (ccc: CuentaCorrienteCliente) => {
              data.ccc = ccc;
              this.storageService.setItem(this.localStorageKey, data);
              this.inicializarForm();
            },
            error: err => {
              this.mensajeService.msg(err.error, MensajeModalType.ERROR)
                .then(() => this.router.navigate(['/pedidos']));
            }
          })
        ;
      } else {
        this.inicializarForm();
      }
    } else {
      this.mensajeService.msg('No se ha especificado un pedido', MensajeModalType.ERROR)
        .then(() => this.router.navigate(['/pedidos']))
      ;
    }
  }

  getDefaultEmptyDataForForm() {
    return {
      ccc: null,
      tipoDeComprobante: null,
      renglones: [],
      observaciones: '',
      descuento: 0,
      recargo: 0,
      idTransportista: null,
      pagos: [],
      idPedido: null,
    };
  }

  panelBeforeChange($event) {
    if (this.saving) {
      $event.preventDefault();
      return;
    }
    if (this.accordion.activeIds.indexOf($event.panelId) >= 0) {
      $event.preventDefault();
    }
  }

  createFrom() {
    this.form = this.fb.group({
      ccc: [null, Validators.required],
      tipoDeComprobante: [null, Validators.required],
      renglones: this.fb.array([], [Validators.required]),
      observaciones: '',
      descuento: [0, Validators.min(0)],
      recargo: [0, Validators.min(0)],
      idTransportista: null,
      pagos: this.fb.array([]),
      idPedido: null,
    });
  }

  inicializarForm() {
    this.form.get('ccc').valueChanges.subscribe(() => {
      this.getTiposDeComprobante();
    });

    this.loadForm();

    this.form.get('tipoDeComprobante').valueChanges
      .subscribe(() => this.recalcularRenglones());

    this.form.get('descuento').valueChanges
      .pipe(debounceTime(700))
      .subscribe(v => {
        const d = parseFloat(v);
        if (Number.isNaN(d) || d < 0) {
          this.form.get('descuento').setValue(0);
          return;
        }
        this.calcularResultados();
      });

    this.form.get('recargo').valueChanges
      .pipe(debounceTime(700))
      .subscribe(v => {
        const r = parseFloat(v);
        if (Number.isNaN(r) || r < 0) {
          this.form.get('recargo').setValue(0);
          return;
        }
        this.calcularResultados();
      });

    this.form.valueChanges.subscribe(v => this.storageService.setItem(this.localStorageKey, v));
  }

  loadForm() {
    const data = this.storageService.getItem(this.localStorageKey);
    this.form.get('ccc').setValue(data && data.ccc ? data.ccc : null);

    if (!data) { return; }

    this.form.get('tipoDeComprobante').setValue(data.tipoDeComprobante ? data.tipoDeComprobante : null);
    if (data.renglones && data.renglones.length) {
      data.renglones.forEach(d => this.renglones.push(this.createRenglonForm(d.renglon, d.checked)));
    }

    this.form.get('observaciones').setValue(data.observaciones ? data.observaciones : '');

    if (data.ccc && this.usuario &&
      !(this.usuario.idUsuario === data.ccc.cliente.idCredencial && this.usuario.roles.indexOf(Rol.VENDEDOR) >= 0)
    ) {
      this.form.get('descuento').setValue(data.descuento ? data.descuento : 0);
    } else {
      this.form.get('descuento').setValue(0);
      this.form.get('descuento').disable();
    }

    this.form.get('recargo').setValue(data.recargo ? data.recargo : 0);
    this.form.get('idTransportista').setValue(data.idTransportista ? Number(data.idTransportista) : null);
    this.form.get('idPedido').setValue(data.idPedido ? Number(data.idPedido) : null);

    if (data.pagos && Array.isArray(data.pagos) && data.pagos.length) {
      data.pagos.forEach((p: { idFormaDePago: number, monto: number }) => this.pagos.push(this.createPagoForm(p)));
    }
  }

  get f() { return this.form.controls; }

  getTiposDeComprobante() {
    const ccc: CuentaCorrienteCliente = this.form?.get('ccc')?.value ?
      this.form.get('ccc').value : null;
    const cliente = ccc?.cliente ?? null;
    if (!cliente) { return; }
    this.loadingOverlayService.activate();
    this.facturasVentaService.getTiposDeComprobante(cliente.idCliente)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((tipos: TipoDeComprobante[]) => {
        let tdc = this.form?.get('tipoDeComprobante')?.value ?? null;
        this.tiposDeComprobanteLabesForCombo = this.tiposDeComprobanteLabels.filter(tcl => tipos?.indexOf(tcl.val) >= 0);
        if (tipos.indexOf(tdc) < 0) {
          tdc = tipos.length ? tipos[0] : null;
        }
        this.form.get('tipoDeComprobante').setValue(tdc);
      });
  }

  get renglones() {
    return this.form.get('renglones') as UntypedFormArray;
  }

  createRenglonForm(r: RenglonFactura, c = false) {
    const formGroup = this.fb.group({ checked: c, renglon: r });

    formGroup.get('checked').valueChanges.subscribe(() => {
      if (this.checkingAll) { return; }
      this.checkingRenglon = true;
      const checkedCount = this.renglones.controls.filter(control => control.get('checked').value).length;
      this.checkAllToggler.nativeElement.checked = checkedCount === this.renglones.length;
      this.checkingRenglon = false;
    });

    return formGroup;
  }

  handleRenglon(r: RenglonFactura) {
    const control = this.searchRFInRenglones(r.idProductoItem);
    if (control) {
      control.get('renglon').setValue(r);
    } else {
      this.renglones.push(this.createRenglonForm(r));
    }
  }

  searchRFInRenglones(idProducto): AbstractControl {
    const controls = this.renglones.controls;
    const aux = controls.filter(c => {
      return c.get('renglon').value.idProductoItem === idProducto;
    });

    return aux.length ? aux[0] : null;
  }

  recalcularRenglones() {
    const tipoDeComprobante = this.form?.get('tipoDeComprobante')?.value ?
      this.form.get('tipoDeComprobante').value : null;

    if (!tipoDeComprobante) { return; }

    if (!this.renglones.length && this.pedido) {
      this.loadingOverlayService.activate();
      this.facturasVentaService.getReglonesDePedido(this.pedido.idPedido, tipoDeComprobante)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(data => this.setRenglonesFactura(data))
      ;
    } else {
      const nrfs = this.renglones.value.map(e => {
        return  {
          bonificacion: null,
          idProducto: e.renglon.idProductoItem,
          cantidad: e.renglon.cantidad,
        };
      });

      this.loadingOverlayService.activate();
      this.facturasVentaService.calcularRenglones(nrfs, tipoDeComprobante)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe((data: RenglonFactura[]) => {
          this.setRenglonesFactura(data);
        })
      ;
    }
  }

  setRenglonesFactura(data: RenglonFactura[]) {
    data.forEach((rf: RenglonFactura) => this.handleRenglon(rf));
    setTimeout(() => this.calcularResultados(), 500);
  }

  calcularResultados() {
    const dp = this.form.get('descuento').value;
    const rp = this.form.get('recargo').value;
    const tdc = this.form && this.form.get('tipoDeComprobante') && this.form.get('tipoDeComprobante').value ?
      this.form.get('tipoDeComprobante').value : null;

    if (!tdc) { return; }

    if (dp < 0 || rp < 0) {
      if (dp < 0) { this.form.get('descuento').setValue(0); }
      if (rp < 0) { this.form.get('recargo').setValue(0); }
      return;
    }

    const nrf: NuevosResultadosComprobante = {
      tipoDeComprobante: tdc,
      descuentoPorcentaje: dp,
      recargoPorcentaje: rp,
      importe: this.form.get('renglones').value.map(e => e.renglon.importe),
      cantidades: this.form.get('renglones').value.map(e => e.renglon.cantidad),
      ivaNetos: this.form.get('renglones').value.map(e => e.renglon.ivaNeto),
      ivaPorcentajes: this.form.get('renglones').value.map(e => e.renglon.ivaPorcentaje),
    };

    this.loadingOverlayService.activate();
    this.facturasService.calcularResultadosFactura(nrf)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((r: Resultados) => this.resultados = r)
    ;
  }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      this.guardarFactura();
    }
  }

  guardarFactura() {
    const formValue = this.form.value;
    const nfv: NuevaFacturaVenta = {
      idSucursal: this.sucursalesService.getIdSucursal(),
      idCliente: formValue.ccc.cliente.idCliente,
      idTransportista: formValue.idTransportista ? Number(formValue.idTransportista) : null,
      fechaVencimiento: null,
      tipoDeComprobante: formValue.tipoDeComprobante,
      observaciones: formValue.observaciones,
      renglonMarcado: formValue.renglones.map(e => e.checked),
      idsFormaDePago: formValue.pagos.map((e) => Number(e.idFormaDePago)),
      montos: formValue.pagos.map((e) => e.monto),
      indices: formValue.renglones.map((e, i) => e.checked ? i : undefined).filter(x => x !== undefined),
      recargoPorcentaje: formValue.recargo,
      descuentoPorcentaje: formValue.descuento,
    };

    this.saving = true;
    this.loadingOverlayService.activate();
    this.facturasVentaService.guardarFacturaVenta(nfv, formValue.idPedido)
      .pipe(finalize(() => {
        this.saving = false;
        this.loadingOverlayService.deactivate();
      }))
      .subscribe({
        next: (fs: FacturaVenta[]) => {
          const f = fs[0];
          this.storageService.removeItem(this.localStorageKey);
          this.pedido = null;
          let msg = 'La factura fué dada de alta correctamente';
          const isABoC = [TipoDeComprobante.FACTURA_A, TipoDeComprobante.FACTURA_B, TipoDeComprobante.FACTURA_C]
            .indexOf(f.tipoComprobante) >= 0;          
          this.mensajeService.msg(msg, MensajeModalType.INFO);
          this.router.navigate(['/facturas-venta']);
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  handleSelectCcc(ccc: CuentaCorrienteCliente) {
    this.form.get('ccc').setValue(ccc);
  }

  volverAlListado() {
    this.location.back();
  }

  toggleCheckAll($event) {
    if (this.checkingRenglon) { return; }
    const checked = $event.target.checked ;
    this.checkingAll = true;
    this.renglones.controls.forEach(e => e.get('checked').setValue(checked));
    this.checkingAll = false;
  }

  getCccLabel() {
    const ccc: CuentaCorrienteCliente = this.form && this.form.get('ccc') ? this.form.get('ccc').value : null;
    if (!ccc) { return ''; }
    return '#' + ccc.cliente.nroCliente + ' - ' + ccc.cliente.nombreFiscal
      + (ccc.cliente.nombreFantasia ? ' - ' + ccc.cliente.nombreFantasia : '');
  }

  getTipoComprobanteLabel() {
    const tipoDeComprobante = this.form?.get('tipoDeComprobante')?.value ?
      this.form.get('tipoDeComprobante').value : null;
    if (tipoDeComprobante) {
      const aux = this.tiposDeComprobanteLabels.filter(tc => tc.val === tipoDeComprobante);
      return aux.length ? aux[0].text : '';
    }
    return '';
  }

  esComprobanteDivido() {
    if (!this.form?.get('renglones')) {
      return false;
    }
    const formValue = this.form.value;
    return formValue.renglones.map((e, i) => e.checked ? i : undefined).filter(x => x !== undefined).length > 0;
  }

  transportistaChange(t: Transportista) {
    this.transportistaSeleccionado = t;
  }

  get pagos() {
    return this.form.get('pagos') as UntypedFormArray;
  }

  createPagoForm(pago: { idFormaDePago: number, monto: number } = { idFormaDePago: null, monto: 0.0 }) {
    return this.fb.group({
      idFormaDePago: [ pago.idFormaDePago, Validators.required ],
      monto: [ pago.monto, [Validators.required, Validators.min(10) ] ]
    });
  }

  addPagoForm() {
    const totalAPagar = this.resultados && this.resultados.total ? this.resultados.total : 0
    const saldoCCC = this.form && this.form.get('ccc') && this.form.get('ccc').value ? this.form.get('ccc').value.saldo : 0;
    let m = 0;
    if (!this.pagos.length) {
      if (saldoCCC <= 0) {
        m = -1 * saldoCCC + totalAPagar;
      } else {
        m = saldoCCC >= totalAPagar ? 0 : (totalAPagar - saldoCCC);
      }
    }
    m = Number(m.toFixed(2));
    this.pagos.push(this.createPagoForm({
      idFormaDePago: this.formaDePagoPredeterminada ? this.formaDePagoPredeterminada.idFormaDePago : null,
      monto: m
    }));
  }

  removePagoForm(i: number) {
    this.pagos.removeAt(i);
  }

  getSaldoCCC() {
    return this.form && this.form.get('ccc') && this.form.get('ccc').value ? this.form.get('ccc').value.saldo : 0;
  }
}
