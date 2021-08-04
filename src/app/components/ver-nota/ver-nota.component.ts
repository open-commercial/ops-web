import {Component, OnInit} from '@angular/core';
import {Nota} from '../../models/nota';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {saveAs} from 'file-saver';
import {HelperService} from '../../services/helper.service';
import {Movimiento} from '../../models/movimiento';

@Component({
  selector: 'app-ver-nota',
  templateUrl: './ver-nota.component.html',
  styleUrls: ['./ver-nota.component.scss']
})
export class VerNotaComponent implements OnInit {
  nota: Nota;
  helper = HelperService;

  movimiento = Movimiento;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private notasService: NotasService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();
    this.notasService.getNota(id)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        nota => this.nota = nota,
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR).then(() => this.location.back()),
      )
    ;
  }

  volverAtras() {
    this.location.back();
  }

  dowloadNotaPdf() {
    if (!this.nota.idCliente) { return; }
    this.loadingOverlayService.activate();
    this.notasService.getReporte(this.nota.idNota)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (res) => {
          const nombreArchivoPDF = this.nota.type === 'NotaCredito' ? 'NotaCredito.pdf' : 'NotaDebito.pdf';
          const file = new Blob([res], {type: 'application/pdf'});
          saveAs(file, nombreArchivoPDF);
        },
        () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
      )
    ;
  }

  getTitle(): string {
    let title = this.helper.tipoComprobanteLabel(this.nota.tipoComprobante) + ' ';
    if (this.nota.numSerieAfip) {
      title += this.helper.formatNumFactura(this.nota.numSerieAfip, this.nota.numNotaAfip);
    } else {
      title += this.helper.formatNumFactura(this.nota.serie, this.nota.nroNota);
    }
    return title;
  }
}
