import {Component, OnInit} from '@angular/core';
import {Nota} from '../../models/nota';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
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
          const file = new Blob([res], {type: 'application/pdf'});
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
        },
        () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
      )
    ;
  }

  getTitle(): string {
    return this.nota.type === 'NotaCredito' ? 'Nota de Crédito' : 'Nota de Débito';    
  }
}
