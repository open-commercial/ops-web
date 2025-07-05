import { Component, OnDestroy, OnInit } from '@angular/core';
import { BatchActionKey, BatchActionsService } from '../../services/batch-actions.service';
import { FacturasVentaService } from '../../services/facturas-venta.service';
import { FacturaVenta } from '../../models/factura-venta';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize } from 'rxjs/operators';
import { MensajeService } from '../../services/mensaje.service';
import { Location } from '@angular/common';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TipoBulto } from '../../models/tipo-bulto';
import { Transportista } from '../../models/transportista';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { TransportistasService } from '../../services/transportistas.service';
import { NuevoRemito } from '../../models/nuevo-remito';
import { RemitosService } from '../../services/remitos.service';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { SucursalesService } from '../../services/sucursales.service';

const bultosCount = (min: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    let cant = 0;
    (control as UntypedFormArray).controls.forEach((b) => {
      cant += b.get('cantidad') && b.get('cantidad').valid ? b.get('cantidad').value : 0;
    });
    return cant >= min ? null : { bultosCount: { count: cant, min } };
  };
};

@Component({
  selector: 'app-remito',
  templateUrl: './remito.component.html',
  styleUrls: ['./remito.component.scss']
})
export class RemitoComponent implements OnInit, OnDestroy {

  facturasVenta: FacturaVenta[] = [];
  form: UntypedFormGroup;
  submitted = false;
  totalBultos = 0;
  totalFacturas = 0;
  transportistas: Transportista[] = [];
  helper = HelperService;
  subscription: Subscription;

  constructor(
    private readonly batchActionsService: BatchActionsService,
    private readonly loadingOverlayService: LoadingOverlayService,
    private readonly facturasVentaService: FacturasVentaService,
    private readonly remitosService: RemitosService,
    private readonly mensajeService: MensajeService,
    private readonly transportistasService: TransportistasService,
    private readonly location: Location,
    private readonly fb: UntypedFormBuilder,
    private readonly route: ActivatedRoute,
    private readonly sucursalesService: SucursalesService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.createForm();

    const idFactura = this.route.snapshot.paramMap.has('id')
      ? Number(this.route.snapshot.paramMap.get('id'))
      : null;

    const ids = idFactura ? [idFactura] : this.batchActionsService.getElements(BatchActionKey.FACTURAS_VENTA).map(bae => bae.id);

    const obs: Observable<any>[] = [
      this.facturasVentaService.getFacturasPorId(ids),
      this.transportistasService.getTransportistas(),
    ];
    this.loadingOverlayService.activate();
    combineLatest(obs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (data: [FacturaVenta[], Transportista[]]) => {
          this.facturasVenta = data[0];
          this.transportistas = data[1];
          try {
            this.checkFacturasVenta();
            this.getTotalDeFacturas();
          } catch (e) {
            this.mensajeService.msg(e.message, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        },
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.volverAlListado();
        },
      );
    this.subscription.add(this.sucursalesService.sucursalSeleccionada$.subscribe(() => this.volverAlListado()));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createForm() {
    this.form = this.fb.group({
      bultos: this.fb.array([], [Validators.required, bultosCount(1)]),
      pesoTotalEnKg: [null, Validators.min(0.1)],
      volumenTotalEnM3: [null, Validators.min(0.1)],
      idTransportista: [null, Validators.required],
      costoDeEnvio: [0, Validators.min(0)],
      observaciones: null,
    });
    this.createCamposBultos();
  }

  createCamposBultos() {
    const tipos = Object.values(TipoBulto);
    tipos.forEach(t => {
      const bControl = this.fb.group({
        check: false, tipo: t, cantidad: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1)]]
      });
      bControl.get('cantidad').valueChanges.subscribe(() => this.totalBultos = this.getTotalBultos());
      this.bultos.push(bControl);
    });
  }

  get bultos() {
    return this.form.get('bultos') as UntypedFormArray;
  }

  getTotalBultos() {
    let cant = 0;
    this.bultos.controls.forEach((b) => {
      cant += b.get('cantidad') && b.get('cantidad').valid ? b.get('cantidad').value : 0;
    });
    return cant;
  }

  volverAlListado() {
    this.location.back();
  }

  checkFacturasVenta() {
    if (!this.facturasVenta.length) {
      throw new Error('Debe seleccionar al menos una factura de venta');
    }

    const idPedido = this.facturasVenta[0].idPedido;
    if (!this.facturasVenta.every(fv => fv.idPedido === idPedido)) {
      throw new Error('Todos las facturas de venta seleccionadas deben ser del mismo pedido');
    }

    if (!this.facturasVenta.every(fv => !fv.remito)) {
      throw new Error('Todos las facturas de venta seleccionadas no deben tener remito asociado.');
    }
  }

  getTotalDeFacturas() {
    this.totalFacturas = 0;
    this.facturasVenta.forEach(fv => this.totalFacturas += fv.total);
  }

  checkChange($event, cantidadControl: AbstractControl) {
    const checked = $event.target.checked;
    if (checked && cantidadControl.disabled) {
      cantidadControl.enable();
      return;
    }
    if (!checked && !cantidadControl.disabled) {
      cantidadControl.disable();
    }
  }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const nr: NuevoRemito = {
        idFacturaVenta: this.facturasVenta.map(fv => fv.idFactura),
        idTransportista: Number(formValues.idTransportista),
        tiposDeBulto: formValues.bultos.filter(b => b.check === true).map(b => b.tipo),
        cantidadPorBulto: formValues.bultos.filter(b => !!b.check).map(b => b.cantidad),
        costoDeEnvio: formValues.costoDeEnvio,
        pesoTotalEnKg: formValues.pesoTotalEnKg,
        volumenTotalEnM3: formValues.volumenTotalEnM3,
        observaciones: formValues.observaciones,
      };

      this.loadingOverlayService.activate();
      this.remitosService.crearRemitosDeFacturasVenta(nr)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          () => {
            this.mensajeService.msg('El Remito fue creado correctamente!', MensajeModalType.INFO);
            this.batchActionsService.clear(BatchActionKey.FACTURAS_VENTA);
            this.volverAlListado();
          },
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        )
        ;
    }
  }
}
