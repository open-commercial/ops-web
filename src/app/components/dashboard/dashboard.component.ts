import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  menuOpened = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleMenu(){
    this.menuOpened = !this.menuOpened;
    const elems = document.getElementsByClassName('ops-web-app');
    const appElement = elems.item(0);
    if (this.menuOpened && appElement) {
      appElement.classList.add('menu-opened');
    } else {
      appElement.classList.remove('menu-opened');
    }
  }

}
