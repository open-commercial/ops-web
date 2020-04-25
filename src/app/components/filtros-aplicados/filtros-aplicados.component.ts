import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-filtros-aplicados',
  templateUrl: './filtros-aplicados.component.html',
  styleUrls: ['./filtros-aplicados.component.scss']
})
export class FiltrosAplicadosComponent implements OnInit {
  private pAppliedFilters: { label: string; value: string; asyncFn?: Observable<string> }[] = [];
  @Input() set appliedFilters(value: { label: string; value: string; asyncFn?: Observable<string> }[]) {
    this.pAppliedFilters = value;
  }
  get appliedFilters() { return this.pAppliedFilters; }

  private pTotalElements = 0;
  @Input() set totalElements(value: number) { this.pTotalElements = value; }
  get totalElements() { return this.pTotalElements; }

  private pOrdenarPorAplicado = '';
  @Input() set ordenarPorAplicado(value: string) { this.pOrdenarPorAplicado = value; }
  get ordenarPorAplicado() { return this.pOrdenarPorAplicado; }

  private pSentidoAplicado = '';
  @Input() set sentidoAplicado(value: string) { this.pSentidoAplicado = value; }
  get sentidoAplicado() { return this.pSentidoAplicado; }

  constructor() { }

  ngOnInit() {
  }
}
