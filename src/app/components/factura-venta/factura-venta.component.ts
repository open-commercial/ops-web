import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FacturasService } from '../../services/facturas.service';
import { HelperService } from '../../services/helper.service';
import { NgbAccordion, NgbAccordionConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { formatNumber, Location } from '@angular/common';
import { ClientesService } from '../../services/clientes.service';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { debounceTime, finalize } from 'rxjs/operators';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { CuentasCorrienteService } from '../../services/cuentas-corriente.service';
import { Producto } from '../../models/producto';
import { RenglonFactura } from '../../models/renglon-factura';
import { CantidadProductoModalComponent } from '../cantidad-producto-modal/cantidad-producto-modal.component';
import { FacturasVentaService } from '../../services/facturas-venta.service';
import { NuevoRenglonFactura } from '../../models/nuevo-renglon-factura';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';
import { SucursalesService } from '../../services/sucursales.service';
import { NuevosResultadosComprobante } from '../../models/nuevos-resultados-comprobante';
import { Resultados } from '../../models/resultados';
import { Transportista } from '../../models/transportista';
import { TransportistasService } from '../../services/transportistas.service';
import { FormaDePago } from '../../models/forma-de-pago';
import { FormasDePagoService } from '../../services/formas-de-pago.service';
import { combineLatest, Observable } from 'rxjs';
import { NuevaFacturaVenta } from '../../models/nueva-factura-venta';
import { StorageService } from '../../services/storage.service';
import { ProductosService } from '../../services/productos.service';
import { ProductosParaVerificarStock } from '../../models/productos-para-verificar-stock';
import { DisponibilidadStockModalComponent } from '../disponibilidad-stock-modal/disponibilidad-stock-modal.component';
import { PedidosService } from '../../services/pedidos.service';
import { EstadoPedido } from '../../models/estado.pedido';
import { Pedido } from '../../models/pedido';
import { ProductoFaltante } from '../../models/producto-faltante';


@Component({
  selector: 'app-factura-venta',
  templateUrl: './factura-venta.component.html',
  styleUrls: ['./factura-venta.component.scss']
})
export class FacturaVentaComponent implements OnInit {
  title = '';
  form: FormGroup;
  submitted = false;
  loading = false;

  helper = HelperService;

  localStorageKey = 'nuevaFactura';

  cccPredeterminado: CuentaCorrienteCliente = null;
  cccPredeterminadoLoading = false;
  cccReadOnly = false;

  loadingTiposDeComprobante = false;
  tiposDeComprobanteLabesForCombo: { val: TipoDeComprobante, text: string }[] = [];

  tiposDeComprobanteLabels = [
    { val: TipoDeComprobante.FACTURA_A, text: 'Factura A' },
    { val: TipoDeComprobante.FACTURA_B, text: 'Factura B' },
    { val: TipoDeComprobante.FACTURA_X, text: 'Factura X' },
    { val: TipoDeComprobante.FACTURA_Y, text: 'Factura Y' },
    { val: TipoDeComprobante.PRESUPUESTO, text: 'Presupuesto' },
  ];

  loadingResultados = false;
  resultados: Resultados;
  recalculandoRenglones = false;

  loadingTransportistas = false;
  transportistas: Transportista[] = [];

  loadingFormasDePago = false;
  formasDePago: FormaDePago[] = [];
  formaDePagoPredeterminada: FormaDePago;

  verificandoPedido = false;
  pedido: Pedido = null;

  saving = false;

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;
  @ViewChild('checkAllToggler', {static: false}) checkAllToggler: ElementRef;
  checkingAll = false;
  checkingRenglon = false;

  verificandoDisponibilidadStock = false;

  constructor(private fb: FormBuilder,
              modalConfig: NgbModalConfig,
              private modalService: NgbModal,
              accordionConfig: NgbAccordionConfig,
              private facturasService: FacturasService,
              private facturasVentaService: FacturasVentaService,
              private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private clientesService: ClientesService,
              private cuentasCorrienteService: CuentasCorrienteService,
              private mensajeService: MensajeService,
              private sucursalesService: SucursalesService,
              private transportistasService: TransportistasService,
              private formasDePagoService: FormasDePagoService,
              private storageService: StorageService,
              private productosService: ProductosService,
              private pedidosService: PedidosService) {
    accordionConfig.type = 'dark';
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit() {
    this.createFrom();
    this.inicializar();
    this.sucursalesService.sucursal$.subscribe(() => this.handleTiposComprobantes());
  }

  inicializar() {
    const obs: Observable<any>[] = [
      this.transportistasService.getTransportistas(),
      this.formasDePagoService.getFormaDePagoPredeterminada(),
      this.formasDePagoService.getFormasDePago(),
      this.clientesService.existeClientePredetermiando()
    ];

    this.loading = true;
    combineLatest(obs)
      .subscribe(
        (data: [Transportista[], FormaDePago, FormaDePago[], boolean]) => {
          this.transportistas = data[0];
          this.formaDePagoPredeterminada = data[1];
          this.formasDePago = data[2];
          if (data[3]) {
            this.cuentasCorrienteService.getCuentaCorrienteClientePredeterminado()
              .pipe(finalize(() => this.loading = false))
              .subscribe(
                (ccc: CuentaCorrienteCliente) => {
                  this.cccPredeterminado = ccc;
                  this.verificarPedido();
                },
                e => this.mensajeService.msg(e.error, MensajeModalType.ERROR),
              )
            ;
          }
        },
        e => {
          this.loading = false;
          this.mensajeService.msg(e.error, MensajeModalType.ERROR);
        }
      )
    ;
  }

  verificarPedido() {
    const idPedido = this.route.snapshot.paramMap.has('id')
      ? Number(this.route.snapshot.paramMap.get('id'))
      : null;
    if (idPedido && idPedido > 0) {
      this.verificandoPedido = true;
      this.pedidosService.getPedido(idPedido)
        .pipe(finalize(() => this.verificandoPedido = false))
        .subscribe(
          (p: Pedido) => {
            if ([EstadoPedido.ACTIVO, EstadoPedido.ABIERTO].indexOf(p.estado) >= 0) {
              this.pedido = p;
              this.checkAndLoadDataForForm();
            } else {
              this.mensajeService.msg(`Estado de pedido Inválido (${p.estado})`, MensajeModalType.ERROR)
                .then(() => this.router.navigate(['/pedidos']));
            }
          },
          e => this.mensajeService.msg(e.error, MensajeModalType.ERROR)
        )
      ;
    } else {
      this.checkAndLoadDataForForm();
    }
  }

  checkAndLoadDataForForm() {
    if (this.pedido) {
      this.localStorageKey = 'factura-de-pedido';
      let data = this.storageService.getItem(this.localStorageKey);
      this.cccReadOnly = true;
      if (!data || !data.idPedido || data.idPedido !== this.pedido.idPedido) {
        data = this.getDefaultEmptyDataForForm();
        data.idPedido = this.pedido.idPedido;
        if (this.cccPredeterminado && this.cccPredeterminado.cliente.idCliente === this.pedido.cliente.idCliente) {
          data.ccc = this.cccPredeterminado;
          this.storageService.setItem(this.localStorageKey, data);
        } else {
          this.cuentasCorrienteService.getCuentaCorriente(this.pedido.cliente.idCliente)
            .subscribe((ccc: CuentaCorrienteCliente) => {
              data.ccc = ccc;
              this.storageService.setItem(this.localStorageKey, data);
              this.ininicializarForm();
            });
          return;
        }
      }
    }
    this.ininicializarForm();
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
      formasPago: [],
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
      formasPago: this.fb.array([]),
      idPedido: null,
    });
  }

  ininicializarForm() {
    this.form.get('ccc').valueChanges.subscribe((ccc: CuentaCorrienteCliente) => {
      this.handleTiposComprobantes();
    });

    this.loadForm();

    this.form.get('tipoDeComprobante').valueChanges
      .subscribe(v => { this.recalcularRenglones(); })
    ;

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
      })
    ;

    this.form.valueChanges.subscribe(v => {
      this.storageService.setItem(this.localStorageKey, v);
    });
  }

  loadForm() {
    const data = this.storageService.getItem(this.localStorageKey);
    this.form.get('ccc').setValue(data && data.ccc ? data.ccc : this.cccPredeterminado);

    if (!data) { return; }

    this.form.get('tipoDeComprobante').setValue(data.tipoDeComprobante ? data.tipoDeComprobante : null);
    if (data.renglones && data.renglones.length) {
      data.renglones.forEach(d => this.renglones.push(this.createRenglonForm(d.renglon, d.checked)));
    }

    this.form.get('observaciones').setValue(data.observaciones ? data.observaciones : '');
    this.form.get('descuento').setValue(data.descuento ? data.descuento : 0);
    this.form.get('recargo').setValue(data.recargo ? data.recargo : 0);
    this.form.get('idTransportista').setValue(data.idTransportista ? Number(data.idTransportista) : null);
    this.form.get('idPedido').setValue(data.idPedido ? Number(data.idPedido) : null);

    if (data.formasPago && data.formasPago.length) {
      data.formasPago.forEach(d => this.formasPago.push(this.createFormaPago(d.idFormaDePago, d.monto)));
    }
  }

  get f() { return this.form.controls; }

  handleTiposComprobantes() {
    const ccc: CuentaCorrienteCliente = this.form && this.form.get('ccc') && this.form.get('ccc').value ?
      this.form.get('ccc').value : null;
    const cliente = ccc && ccc.cliente ? ccc.cliente : null;
    if (!cliente) { return; }
    this.loadingTiposDeComprobante = false;
    this.facturasVentaService.getTiposDeComprobante(cliente.idCliente)
      .pipe(finalize(() => this.loadingTiposDeComprobante = false))
      .subscribe((tipos: TipoDeComprobante[]) => {
        let tdc = this.form && this.form.get('tipoDeComprobante') && this.form.get('tipoDeComprobante').value
          ? this.form.get('tipoDeComprobante').value : null;
        this.tiposDeComprobanteLabesForCombo = this.createTiposDeComprobantesForCombo(tipos);
        if (tipos.indexOf(tdc) < 0) { tdc = tipos.length ? tipos[0] : null; }
        this.form.get('tipoDeComprobante').setValue(tdc);
      })
    ;
  }

  createTiposDeComprobantesForCombo(tipos: TipoDeComprobante[]) {
    return this.tiposDeComprobanteLabels.filter(tcl => tipos.indexOf(tcl.val) >= 0);
  }

  get renglones() {
    return this.form.get('renglones') as FormArray;
  }

  createRenglonForm(r: RenglonFactura, c = false) {
    const formGroup = this.fb.group({ checked: c, renglon: r });

    formGroup.get('checked').valueChanges.subscribe(v => {
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

  editarRenglon(rpControl: AbstractControl) {
    if (rpControl) {
      const rf: RenglonFactura = rpControl.get('renglon').value;
      this.showCantidadModal(rf.idProductoItem, rf.cantidad);
    }
  }

  eliminarRenglon(index: number) {
    const rf: RenglonFactura = this.renglones.at(index).get('renglon').value;
    const msg = `¿Desea quitar de la factura al producto #${rf.codigoItem} - ${rf.descripcionItem}?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.renglones.removeAt(index);
        this.calcularResultados();
      }
    });
  }

  addRenglonFactura(nrf: NuevoRenglonFactura) {
    const tipoDeComprobante = this.form && this.form.get('tipoDeComprobante') && this.form.get('tipoDeComprobante').value ?
      this.form.get('tipoDeComprobante').value : null;
    if (!tipoDeComprobante) { return; }
    this.recalculandoRenglones = true;
    this.facturasVentaService.calcularRenglones([nrf], tipoDeComprobante)
      .pipe(finalize(() => this.recalculandoRenglones = false))
      .subscribe((data: RenglonFactura[]) => { this.handleRenglon(data[0]); this.calcularResultados(); });
  }

  searchRFInRenglones(idProducto): AbstractControl {
    const controls = this.renglones.controls;
    const aux = controls.filter(c => {
      return c.get('renglon').value.idProductoItem === idProducto;
    });

    return aux.length ? aux[0] : null;
  }

  recalcularRenglones() {
    const tipoDeComprobante = this.form && this.form.get('tipoDeComprobante') && this.form.get('tipoDeComprobante').value ?
      this.form.get('tipoDeComprobante').value : null;
    if (!tipoDeComprobante) { return; }

    this.recalculandoRenglones = true;
    if (!this.renglones.length && this.pedido) {
      this.facturasVentaService.getReglonesDePedido(this.pedido.idPedido, tipoDeComprobante)
        .pipe(finalize(() => this.recalculandoRenglones = false))
        .subscribe(data => this.setRenglonesFactura(data))
      ;
    } else {
      const nrfs = this.renglones.value.map(e => {
        const nrf: NuevoRenglonFactura = {
          bonificacion: null,
          idProducto: e.renglon.idProductoItem,
          cantidad: e.renglon.cantidad,
        };
        return nrf;
      });

      this.facturasVentaService.calcularRenglones(nrfs, tipoDeComprobante)
        .pipe(finalize(() => this.recalculandoRenglones = false))
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

  get formasPago() {
    return this.form.get('formasPago') as FormArray;
  }

  agregarFormDePago() {
    this.formasPago.push(this.createFormaPago());
  }

  createFormaPago(idFormaPago = null, m: number = 0) {
    const monto = this.formasPago.length ? m : this.getTotalFactura();
    return this.fb.group({
      idFormaDePago: [
        idFormaPago ? idFormaPago : (this.formaDePagoPredeterminada ? this.formaDePagoPredeterminada.idFormaDePago : null),
        Validators.required
      ],
      monto: [monto, [Validators.required, Validators.min(1)]]
    });
  }

  getTotalFactura() {
    // Formateo el total de la factura de la misma forma que se muestra que en la vista pero para le locale en-US
    // (con punto decimal) y quito el separador de mil (coma para ese locale)
    if (!this.resultados) { return 0; }
    return parseFloat(formatNumber(this.resultados.total, 'en-US', '1.0-2').replace(',', ''));
  }

  quitarFormaPago(index: number) {
    const msg = '¿Desea quitar la forma de pago?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) { this.formasPago.removeAt(index); }
    });
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

    this.loadingResultados = true;

    const nrf: NuevosResultadosComprobante = {
      tipoDeComprobante: tdc,
      descuentoPorcentaje: dp,
      recargoPorcentaje: rp,
      importe: this.form.get('renglones').value.map(e => e.renglon.importe),
      cantidades: this.form.get('renglones').value.map(e => e.renglon.cantidad),
      ivaNetos: this.form.get('renglones').value.map(e => e.renglon.ivaNeto),
      ivaPorcentajes: this.form.get('renglones').value.map(e => e.renglon.ivaPorcentaje),
    };

    this.facturasService.calcularResultadosFactura(nrf)
      .pipe(finalize(() => this.loadingResultados = false))
      .subscribe((r: Resultados) => this.resultados = r)
    ;
  }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValue = this.form.value;
      this.verificandoDisponibilidadStock = true;
      const ppvs: ProductosParaVerificarStock = {
        idSucursal: this.sucursalesService.getIdSucursal(),
        idProducto: formValue.renglones.map(e => e.renglon.idProductoItem),
        cantidad: formValue.renglones.map(e => e.renglon.cantidad),
      };
      this.productosService.getDisponibilidadEnStock(ppvs)
        .pipe(finalize(() => this.verificandoDisponibilidadStock = false))
        .subscribe((pfs: ProductoFaltante[]) => {
            if (!pfs.length) {
              this.doSubmit();
            } else {
              const modalRef = this.modalService.open(DisponibilidadStockModalComponent, { size: 'lg', scrollable: true });
              modalRef.componentInstance.data = pfs;
            }
          }
        )
      ;
    }
  }

  doSubmit() {
    const total = this.getTotalFactura();
    const totalEnFormasPago = this.form.value.formasPago.reduce((sum, v) => sum + v.monto, 0);
    let montoWarning = '';

    if (totalEnFormasPago > total) {
      montoWarning = 'Los montos ingresados superan el total a pagar. ¿Desea continuar?';
    }

    if (totalEnFormasPago < total) {
      montoWarning = 'Los montos ingresados no cubren el total a pagar. ¿Desea continuar?';
    }

    if (montoWarning) {
      this.mensajeService.msg(montoWarning, MensajeModalType.ALERT).then((result) => {
        if (result) { this.guardarFactura(); }
      });
    } else {
      this.guardarFactura();
    }
  }

  guardarFactura() {
    const formValue = this.form.value;
    const nfv: NuevaFacturaVenta = {
      idSucursal: this.sucursalesService.getIdSucursal(),
      idPedido: formValue.idPedido,
      idCliente: formValue.ccc.cliente.idCliente,
      idTransportista: formValue.transportista ? Number(formValue.transportista) : null,
      fechaVencimiento: null,
      tipoDeComprobante: formValue.tipoDeComprobante,
      observaciones: formValue.observaciones,
      renglones: formValue.renglones.map(e => {
        const nrf: NuevoRenglonFactura = {
          cantidad: e.renglon.cantidad,
          idProducto: e.renglon.idProductoItem,
          bonificacion: null,
        };
        return nrf;
      }),
      idsFormaDePago: formValue.formasPago.map((e) => Number(e.idFormaDePago)),
      montos: formValue.formasPago.map((e) => e.monto),
      indices: formValue.renglones.map((e, i) => e.checked ? i : undefined).filter(x => x !== undefined),
      recargoPorcentaje: formValue.recargo,
      descuentoPorcentaje: formValue.descuento,
    };

    this.saving = true;
    this.facturasVentaService.guardarFacturaVenta(nfv)
      .pipe(finalize(() => this.saving = false))
      .subscribe(
        fvs => {
          this.storageService.removeItem(this.localStorageKey);
          this.router.navigate(['/facturas-venta']);
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }

  handleSelectCcc(ccc: CuentaCorrienteCliente) {
    this.form.get('ccc').setValue(ccc);
  }

  selectProducto(p: Producto) {
    const control = this.searchRFInRenglones(p.idProducto);
    const cPrevia = control ? control.get('renglon').value.cantidad : 1;
    this.showCantidadModal(p.idProducto, cPrevia);
  }

  showCantidadModal(idProductoItem: number, cantidadPrevia = 1) {
    const modalRef = this.modalService.open(CantidadProductoModalComponent);
    modalRef.componentInstance.cantidad = cantidadPrevia;
    modalRef.componentInstance.loadProducto(idProductoItem);
    modalRef.result.then((cant: number) => {

      const ppvs: ProductosParaVerificarStock = {
        idSucursal: this.sucursalesService.getIdSucursal(),
        idProducto: [idProductoItem],
        cantidad: [cant],
      };

      this.verificandoDisponibilidadStock = true;
      this.productosService.getDisponibilidadEnStock(ppvs)
        .pipe(finalize(() => this.verificandoDisponibilidadStock = false))
        .subscribe((pfs: ProductoFaltante[]) => {
          if (!pfs.length) {
            const nrf: NuevoRenglonFactura = {
              cantidad: cant,
              idProducto: idProductoItem,
              bonificacion: null,
            };
            this.addRenglonFactura(nrf);
          } else {
            this.mensajeService.msg('La cantidad solicitada del producto supera el stock disponible.', MensajeModalType.ERROR);
          }
        })
      ;
    }, (reason) => {});
  }

  directInputSeleccionProducto(p: Producto) {
    const rf = this.searchRFInRenglones(p.idProducto);
    let cant = 1;
    if (rf) { cant = rf.get('renglon').value.cantidad + 1; }

    const nrf: NuevoRenglonFactura = {
      cantidad: cant,
      idProducto: p.idProducto,
      bonificacion: null,
    };

    this.addRenglonFactura(nrf);
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
    const tipoDeComprobante = this.form && this.form.get('tipoDeComprobante') && this.form.get('tipoDeComprobante').value ?
      this.form.get('tipoDeComprobante').value : null;
    if (tipoDeComprobante) {
      const aux = this.tiposDeComprobanteLabels.filter(tc => tc.val === tipoDeComprobante);
      return aux.length ? aux[0].text : '';
    }
    return '';
  }

  esComprobanteDivido() {
    if (!this.form || !this.form.get('renglones')) {
      return false;
    }
    const formValue = this.form.value;
    return formValue.renglones.map((e, i) => e.checked ? i : undefined).filter(x => x !== undefined).length > 0;
  }
}
