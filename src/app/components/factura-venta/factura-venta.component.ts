import { Component, OnInit, ViewChild } from '@angular/core';
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
import { combineLatest } from 'rxjs';
import { NuevaFacturaVenta } from '../../models/nueva-factura-venta';
import { StorageService } from '../../services/storage.service';


@Component({
  selector: 'app-factura-venta',
  templateUrl: './factura-venta.component.html',
  styleUrls: ['./factura-venta.component.scss']
})
export class FacturaVentaComponent implements OnInit {
  title = '';
  form: FormGroup;
  submitted = false;

  helper = HelperService;

  localStorageKey = 'nuevaFactura';

  cccPredeterminado: CuentaCorrienteCliente = null;
  cccPredeterminadoLoading = false;

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

  saving = false;

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;

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
              private storageService: StorageService) {
    accordionConfig.type = 'dark';
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit() {
    this.getTransportistas();
    this.getFormasDePago();
    this.createFrom();
    this.handleClientePredeterminado();
    this.sucursalesService.sucursal$.subscribe(() => this.handleTiposComprobantes());
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

  handleClientePredeterminado() {
    this.cccPredeterminadoLoading = true;
    this.clientesService.existeClientePredetermiando()
      .subscribe(
        v => {
          if (v) {
            this.cuentasCorrienteService.getCuentaCorrienteClientePredeterminado()
              .pipe(finalize(() => this.cccPredeterminadoLoading = false))
              .subscribe(
                c => { this.cccPredeterminado = c; this.form.get('ccc').setValue(c); },
                e => this.mensajeService.msg(e.error, MensajeModalType.ERROR),
              )
            ;
          } else {
            this.cccPredeterminadoLoading = false;
          }
        },
        e => {
          this.cccPredeterminadoLoading = false;
          this.mensajeService.msg(e.error, MensajeModalType.ERROR);
        }
      )
    ;
  }

  getTransportistas() {
    this.loadingTransportistas = true;
    this.transportistasService.getTransportistas()
      .pipe(finalize(() => this.loadingTransportistas = false))
      .subscribe((ts: Transportista[]) => this.transportistas = ts)
    ;
  }

  getFormasDePago() {
    this.loadingFormasDePago = true;
    combineLatest([
      this.formasDePagoService.getFormaDePagoPredeterminada(),
      this.formasDePagoService.getFormasDePago()
    ])
      .pipe(finalize(() => this.loadingFormasDePago = false))
      .subscribe((v: [FormaDePago, FormaDePago[]]) => {
        this.formaDePagoPredeterminada = v[0];
        this.formasDePago = v[1];
      })
    ;
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
      formasPago: this.fb.array([], [Validators.required]),
    });

    this.form.get('ccc').valueChanges.subscribe((ccc: CuentaCorrienteCliente) => {
      this.handleTiposComprobantes();
    });

    this.form.get('tipoDeComprobante').valueChanges
      .subscribe(v => {
        if (!this.loadingResultados) { this.recalcularRenglones(); }
      })
    ;

    this.form.get('renglones').valueChanges
      .subscribe(v => {
        if (!this.loadingResultados && !this.recalculandoRenglones) { this.calcularResultados(); }
      });

    this.form.get('descuento').valueChanges
      .pipe(debounceTime(700))
      .subscribe(v => {
        const d = parseFloat(v);
        if (Number.isNaN(d) || d < 0) {
          this.form.get('descuento').setValue(0);
          return;
        }
        if (!this.loadingResultados) { this.calcularResultados(); }
      });

    this.form.get('recargo').valueChanges
      .pipe(debounceTime(700))
      .subscribe(v => {
        const r = parseFloat(v);
        if (Number.isNaN(r) || r < 0) {
          this.form.get('recargo').setValue(0);
          return;
        }
        if (!this.loadingResultados) { this.calcularResultados(); }
      })
    ;

    this.form.valueChanges.subscribe(v => {
      this.storageService.setItem(this.localStorageKey, v);
    });

    const fv = this.storageService.getItem(this.localStorageKey);
    this.loadForm(fv);
  }

  loadForm(data) {
    if (!data) { return; }

    this.form.get('ccc').setValue(data.ccc ? data.ccc : this.cccPredeterminado);
    this.form.get('tipoDeComprobante').setValue(data.tipoDeComprobante ? data.tipoDeComprobante : null);
    if (data.renglones && data.renglones.length) {
      data.renglones.forEach(d => this.renglones.push(this.createRenglonForm(d.renglon, d.checked)));
    }

    this.form.get('observaciones').setValue(data.observaciones ? data.observaciones : '');
    this.form.get('descuento').setValue(data.descuento ? data.descuento : 0);
    this.form.get('recargo').setValue(data.recargo ? data.recargo : 0);
    this.form.get('idTransportista').setValue(data.idTransportista ? Number(data.idTransportista) : null);

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
      .pipe(finalize(() => {
        this.loadingTiposDeComprobante = false;
      }))
      .subscribe((tipos: TipoDeComprobante[]) => {
        this.tiposDeComprobanteLabesForCombo = this.createTiposDeComprobantesForCombo(tipos);
        this.form.get('tipoDeComprobante').setValue(tipos.length ? tipos[0] : null);
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
    return this.fb.group({
      checked: c,
      renglon: r,
    });
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
      if (result) { this.renglones.removeAt(index); }
    });
  }

  addRenglonFactura(nrf: NuevoRenglonFactura) {
    const tipoDeComprobante = this.form && this.form.get('tipoDeComprobante') && this.form.get('tipoDeComprobante').value ?
      this.form.get('tipoDeComprobante').value : null;
    if (!tipoDeComprobante) { return; }
    this.facturasVentaService.calcularRenglones([nrf], tipoDeComprobante)
      .subscribe((data: RenglonFactura[]) => this.handleRenglon(data[0]));
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
    const nrfs = this.renglones.value.map(e => {
      const nrf: NuevoRenglonFactura = {
        bonificacion: null,
        idProducto: e.renglon.idProductoItem,
        cantidad: e.renglon.cantidad,
      };
      return nrf;
    });
    this.recalculandoRenglones = true;
    this.facturasVentaService.calcularRenglones(nrfs, tipoDeComprobante)
      .pipe(finalize(() => this.recalculandoRenglones = false))
      .subscribe((data: RenglonFactura[]) => {
        data.forEach((rf: RenglonFactura) => {
          const rControl = this.searchRFInRenglones(rf.idProductoItem);
          rControl.get('renglon').setValue(rf);
        });
        this.calcularResultados();
      })
    ;
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
  }

  guardarFactura() {
    const formValue = this.form.value;
    const nfv: NuevaFacturaVenta = {
      idSucursal: this.sucursalesService.getIdSucursal(),
      idPedido: null,
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
      const nrf: NuevoRenglonFactura = {
        cantidad: cant,
        idProducto: idProductoItem,
        bonificacion: null,
      };

      this.addRenglonFactura(nrf);
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
    console.log($event.target.checked);
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
}
